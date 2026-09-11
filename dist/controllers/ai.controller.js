import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { Product } from '../models/Product.js';
import { LUXURY_PRODUCTS } from '../config/defaultProducts.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { ENV } from '../config/env.js';
import { AIWorkflowService } from '../services/ai/workflow.service.js';
// Danh sách người mẫu mẫu có sẵn với vóc dáng chuẩn, trang phục trung tính
export const SAMPLE_MODELS = [
    {
        id: 'model-female-01',
        name: 'Diễm My (Nữ · 1m68 · Form Chuẩn)',
        gender: 'female',
        height: '1m68',
        weight: '50kg',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        fullBodyImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop&q=80',
        description: 'Dáng người thanh mảnh, phù hợp với các mẫu đầm dạ hội, váy xòe, set vest nữ.'
    },
    {
        id: 'model-male-01',
        name: 'Hoàng Nam (Nam · 1m80 · Form Chuẩn)',
        gender: 'male',
        height: '1m80',
        weight: '72kg',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        fullBodyImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&auto=format&fit=crop&q=80',
        description: 'Vóc dáng thể thao, vai rộng, rất chuẩn khi mặc vest suit, áo sơ mi, áo khoác măng tô.'
    },
    {
        id: 'model-female-02',
        name: 'Khánh Linh (Nữ · 1m62 · Nhỏ Nhắn)',
        gender: 'female',
        height: '1m62',
        weight: '46kg',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
        fullBodyImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&auto=format&fit=crop&q=80',
        description: 'Vóc dáng trẻ trung, hiện đại, thích hợp với áo sơ mi lụa, chân váy, đầm dạo phố.'
    },
    {
        id: 'model-male-02',
        name: 'Quốc Bảo (Nam · 1m75 · Cân Đối)',
        gender: 'male',
        height: '1m75',
        weight: '68kg',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
        fullBodyImage: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=900&auto=format&fit=crop&q=80',
        description: 'Dáng người chuẩn công sở Châu Á, phù hợp áo sơ mi, quần âu slimfit và blazer.'
    }
];
/**
 * Danh sách HuggingFace Space mirrors cho IDM-VTON (fallback khi space chính bị lỗi)
 */
const HF_VTON_SPACES = [
    'https://yisol-idm-vton.hf.space',
    'https://levihsu-ootdiffusion.hf.space',
];
/**
 * Upload blob lên HuggingFace Space, trả về path trên server
 */
async function uploadToHFSpace(spaceUrl, blob, filename, signal) {
    const fd = new FormData();
    fd.append('files', blob, filename);
    const upRes = await fetch(`${spaceUrl}/upload`, {
        method: 'POST',
        body: fd,
        signal
    });
    if (!upRes.ok)
        return null;
    const upData = await upRes.json();
    if (Array.isArray(upData) && upData[0])
        return upData[0];
    return null;
}
/**
 * Chuyển đổi personImage/garmentImage thành Blob để upload
 */
async function imageSourceToBlob(src, signal) {
    if (src.startsWith('data:')) {
        const b64 = src.replace(/^data:image\/\w+;base64,/, '');
        return new Blob([Buffer.from(b64, 'base64')], { type: 'image/jpeg' });
    }
    else if (src.startsWith('/')) {
        try {
            const localPath = path.join(process.cwd(), 'public', src);
            const fileBuf = await fs.promises.readFile(localPath);
            return new Blob([fileBuf], { type: 'image/jpeg' });
        }
        catch {
            const fetchUrl = `http://127.0.0.1:${ENV.PORT}${src}`;
            const fRes = await fetch(fetchUrl, { signal });
            return await fRes.blob();
        }
    }
    else {
        const fRes = await fetch(src, { signal });
        return await fRes.blob();
    }
}
/**
 * Parse kết quả SSE từ HuggingFace, trả về URL ảnh hoặc null
 */
function parseHFSseResult(sseText, spaceUrl) {
    // Format 1: URL trực tiếp trong SSE text
    const escapedUrl = spaceUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const urlMatch = sseText.match(new RegExp(`${escapedUrl}/file=[^\\s",}]+`));
    if (urlMatch && urlMatch[0])
        return urlMatch[0];
    // Format 2: JSON data array với url field
    const jsonDataMatch = sseText.match(/data:\s*(\[[\s\S]*?\])\s*(?:\n|$)/);
    if (jsonDataMatch && jsonDataMatch[1]) {
        try {
            const results = JSON.parse(jsonDataMatch[1]);
            if (Array.isArray(results)) {
                for (const item of results) {
                    if (item && typeof item === 'object') {
                        const url = item.url || item.path || (item.value && item.value.url);
                        if (url && typeof url === 'string' && url.startsWith('http'))
                            return url;
                        if (url && typeof url === 'string' && url.startsWith('/file='))
                            return `${spaceUrl}${url}`;
                    }
                    // Nếu item là string URL
                    if (typeof item === 'string' && (item.startsWith('http') || item.startsWith('/file='))) {
                        return item.startsWith('http') ? item : `${spaceUrl}${item}`;
                    }
                }
            }
        }
        catch { }
    }
    // Format 3: JSON object đơn lẻ
    const jsonObjMatch = sseText.match(/data:\s*(\{[\s\S]*?\})\s*(?:\n|$)/);
    if (jsonObjMatch && jsonObjMatch[1]) {
        try {
            const obj = JSON.parse(jsonObjMatch[1]);
            const url = obj.url || obj.path || obj.image;
            if (url && typeof url === 'string') {
                return url.startsWith('http') ? url : `${spaceUrl}${url}`;
            }
        }
        catch { }
    }
    // Format 4: Bất kỳ URL ảnh HF nào
    const genericUrlMatch = sseText.match(/https?:\/\/[^\s",}]*(?:\.png|\.jpg|\.jpeg|\.webp|file=[^\s",}]+)/i);
    if (genericUrlMatch && genericUrlMatch[0])
        return genericUrlMatch[0];
    return null;
}
/**
 * Gọi API IDM-VTON ZeroGPU (HuggingFace) để tạo ảnh thử đồ thật từ trí tuệ nhân tạo
 * Có retry 3 lần với exponential backoff, timeout 120 giây
 */
async function callIdmVtonHF(personImage, garmentImage, garmentDesc) {
    const MAX_RETRIES = 3;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        // Chọn space: lần 1 dùng space chính, lần sau rotate sang mirror
        const spaceUrl = HF_VTON_SPACES[(attempt - 1) % HF_VTON_SPACES.length];
        console.log(`🤖 IDM-VTON: Lần thử ${attempt}/${MAX_RETRIES} - Space: ${spaceUrl}`);
        const uploadController = new AbortController();
        const uploadTimeout = setTimeout(() => uploadController.abort(), 45000); // 45s cho upload
        try {
            console.log('   - Person image:', personImage.substring(0, 80) + '...');
            console.log('   - Garment image:', garmentImage.substring(0, 80) + '...');
            // 1. Upload ảnh người
            let humanPath = personImage;
            if (personImage.startsWith('data:') || personImage.startsWith('http') || personImage.startsWith('/')) {
                const blob = await imageSourceToBlob(personImage, uploadController.signal);
                const uploaded = await uploadToHFSpace(spaceUrl, blob, 'person.jpg', uploadController.signal);
                if (uploaded) {
                    humanPath = uploaded;
                    console.log('   ✅ Upload person thành công:', humanPath);
                }
                else {
                    console.warn('   ⚠️ Upload person thất bại, dùng URL gốc');
                }
            }
            // 2. Upload ảnh trang phục
            let garmPath = garmentImage;
            if (garmentImage.startsWith('data:') || garmentImage.startsWith('http') || garmentImage.startsWith('/')) {
                const blob = await imageSourceToBlob(garmentImage, uploadController.signal);
                const uploaded = await uploadToHFSpace(spaceUrl, blob, 'garment.jpg', uploadController.signal);
                if (uploaded) {
                    garmPath = uploaded;
                    console.log('   ✅ Upload garment thành công:', garmPath);
                }
                else {
                    console.warn('   ⚠️ Upload garment thất bại, dùng URL gốc');
                }
            }
            clearTimeout(uploadTimeout);
            // 3. Kích hoạt model IDM-VTON
            const inferController = new AbortController();
            const inferTimeout = setTimeout(() => inferController.abort(), 120000); // 120s cho inference
            try {
                console.log('   🚀 Gửi request tới IDM-VTON model...');
                const callRes = await fetch(`${spaceUrl}/call/tryon`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        data: [
                            {
                                background: { path: humanPath, meta: { _type: 'gradio.FileData' } },
                                layers: [],
                                composite: null
                            },
                            { path: garmPath, meta: { _type: 'gradio.FileData' } },
                            garmentDesc || 'luxury garment outfit',
                            true,
                            false,
                            20,
                            42
                        ]
                    }),
                    signal: inferController.signal
                });
                if (!callRes.ok) {
                    console.warn(`   ❌ IDM-VTON: HTTP ${callRes.status} - ${callRes.statusText}`);
                    clearTimeout(inferTimeout);
                    // Backoff trước khi retry
                    if (attempt < MAX_RETRIES) {
                        const delay = Math.min(5000 * Math.pow(2, attempt - 1), 20000);
                        console.log(`   ⏳ Chờ ${delay / 1000}s trước khi thử lại...`);
                        await new Promise(r => setTimeout(r, delay));
                    }
                    continue;
                }
                const callData = await callRes.json();
                const eventId = callData.event_id;
                if (!eventId) {
                    console.warn('   ❌ IDM-VTON: Không nhận được event_id. Response:', JSON.stringify(callData).substring(0, 200));
                    clearTimeout(inferTimeout);
                    if (attempt < MAX_RETRIES) {
                        const delay = Math.min(5000 * Math.pow(2, attempt - 1), 20000);
                        await new Promise(r => setTimeout(r, delay));
                    }
                    continue;
                }
                console.log('   📡 Nhận event_id:', eventId, '- Đang chờ kết quả...');
                // 4. Nhận kết quả từ luồng SSE
                const sseRes = await fetch(`${spaceUrl}/call/tryon/${eventId}`, {
                    signal: inferController.signal
                });
                const sseText = await sseRes.text();
                // Kiểm tra lỗi trong SSE
                if (sseText.includes('"error"') || sseText.includes('queue_full') || sseText.includes('GPU quota')) {
                    console.warn('   ⚠️ IDM-VTON: Space lỗi hoặc hết quota. SSE:', sseText.substring(0, 200));
                    clearTimeout(inferTimeout);
                    if (attempt < MAX_RETRIES) {
                        const delay = Math.min(8000 * Math.pow(2, attempt - 1), 30000);
                        console.log(`   ⏳ Chờ ${delay / 1000}s trước khi thử lại...`);
                        await new Promise(r => setTimeout(r, delay));
                    }
                    continue;
                }
                // Parse kết quả
                const resultUrl = parseHFSseResult(sseText, spaceUrl);
                if (resultUrl) {
                    console.log('   🎉 IDM-VTON thành công! Ảnh kết quả:', resultUrl);
                    clearTimeout(inferTimeout);
                    return resultUrl;
                }
                console.warn('   ⚠️ IDM-VTON: Không tìm thấy URL ảnh. SSE text:', sseText.substring(0, 400));
                clearTimeout(inferTimeout);
            }
            catch (inferErr) {
                clearTimeout(inferTimeout);
                if (inferErr.name === 'AbortError') {
                    console.warn(`   ⏱️ IDM-VTON: Inference timeout (120s) - lần ${attempt}`);
                }
                else {
                    console.warn(`   ❌ IDM-VTON inference error (lần ${attempt}):`, inferErr.message);
                }
            }
        }
        catch (err) {
            clearTimeout(uploadTimeout);
            if (err.name === 'AbortError') {
                console.warn(`   ⏱️ IDM-VTON: Upload timeout (45s) - lần ${attempt}`);
            }
            else {
                console.warn(`   ❌ IDM-VTON upload error (lần ${attempt}):`, err.message);
            }
        }
        // Exponential backoff trước khi retry
        if (attempt < MAX_RETRIES) {
            const delay = Math.min(5000 * Math.pow(2, attempt - 1), 20000);
            console.log(`   ⏳ Backoff ${delay / 1000}s trước lần thử ${attempt + 1}...`);
            await new Promise(r => setTimeout(r, delay));
        }
    }
    console.warn('   ❌ IDM-VTON: Tất cả các lần thử đều thất bại');
    return null;
}
export class AIController {
    /**
     * Lấy danh sách người mẫu ảo mẫu có sẵn
     */
    static async getSampleModels(req, res) {
        sendSuccess(res, SAMPLE_MODELS, 'Lấy danh sách người mẫu mẫu thành công');
    }
    /**
     * AI Virtual Try-On API: Nhận ảnh người dùng + sản phẩm -> Tạo ảnh người mặc trang phục
     */
    static async tryOn(req, res, next) {
        try {
            const { personImage, productId, garmentImage, category, modelGender } = req.body;
            if (!personImage) {
                sendError(res, 'Vui lòng cung cấp ảnh người dùng (personImage)', 400, 'MISSING_PERSON_IMAGE');
                return;
            }
            // Lấy thông tin sản phẩm từ database nếu có productId
            let product = null;
            let targetGarmentUrl = garmentImage || '';
            if (productId) {
                try {
                    if (mongoose.Types.ObjectId.isValid(productId)) {
                        product = await Product.findById(productId);
                    }
                    if (!product) {
                        product = await Product.findOne({ id: Number(productId) || productId });
                    }
                }
                catch (e) {
                    console.warn('⚠️ Lỗi truy vấn Product trong tryOn, fallback sang danh mục Luxury:', e.message);
                }
                // Fallback sang LUXURY_PRODUCTS nếu MongoDB không kết nối được hoặc không tìm thấy
                if (!product) {
                    product = LUXURY_PRODUCTS.find((p) => String(p.id) === String(productId) ||
                        String(p._id) === String(productId) ||
                        (p.name && p.name.toLowerCase().includes(String(productId).toLowerCase())));
                }
                if (product && !targetGarmentUrl) {
                    targetGarmentUrl = product.image || (product.variants && product.variants[0]?.img) || '';
                }
            }
            if (!targetGarmentUrl && !product) {
                sendError(res, 'Vui lòng chọn sản phẩm thời trang hoặc cung cấp ảnh trang phục (garmentImage)', 400, 'MISSING_GARMENT');
                return;
            }
            const fashnKey = process.env.FASHN_API_KEY;
            const replicateKey = process.env.REPLICATE_API_TOKEN;
            // Chạy toàn bộ quy trình AI Agent Pipeline qua AIWorkflowService
            const workflowResult = await AIWorkflowService.runTryOnWorkflow({
                personImage,
                garmentImage: targetGarmentUrl,
                product,
                modelGender,
                vtonModelCaller: async (pImg, gImg, wf, garmDesc, mask, attempt) => {
                    let resultImageUrl = '';
                    let provider = 'client-synthesis';
                    // 1. Tích hợp Fashn.ai nếu có key
                    if (fashnKey) {
                        try {
                            provider = 'fashn';
                            const runRes = await fetch('https://api.fashn.ai/v1/run', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${fashnKey}`
                                },
                                body: JSON.stringify({
                                    model_image: pImg,
                                    garment_image: gImg,
                                    category: category || 'all-body',
                                    mode: 'performance',
                                    nsfw_filter: true
                                })
                            });
                            const runData = await runRes.json();
                            if (runData.id) {
                                for (let i = 0; i < 30; i++) {
                                    await new Promise(r => setTimeout(r, 2000));
                                    const statusRes = await fetch(`https://api.fashn.ai/v1/status/${runData.id}`, {
                                        headers: { 'Authorization': `Bearer ${fashnKey}` }
                                    });
                                    const statusData = await statusRes.json();
                                    if (statusData.status === 'completed' && statusData.output && statusData.output[0]) {
                                        resultImageUrl = statusData.output[0];
                                        break;
                                    }
                                    if (statusData.status === 'failed')
                                        break;
                                }
                            }
                        }
                        catch (fashnErr) {
                            console.warn('⚠️ Fashn API error:', fashnErr.message);
                        }
                    }
                    // 2. Tích hợp Replicate IDM-VTON nếu có token
                    if (!resultImageUrl && replicateKey) {
                        try {
                            provider = 'replicate';
                            const repRes = await fetch('https://api.replicate.com/v1/predictions', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Token ${replicateKey}`
                                },
                                body: JSON.stringify({
                                    version: 'c871bb9b046607b680449ecbae55fd8e6d945e0a1948644bf2361b3d021d3ff4',
                                    input: {
                                        human_img: pImg,
                                        garm_img: gImg,
                                        garment_des: garmDesc || 'luxury designer outfit'
                                    }
                                })
                            });
                            const repData = await repRes.json();
                            if (repData.id) {
                                for (let i = 0; i < 30; i++) {
                                    await new Promise(r => setTimeout(r, 2500));
                                    const stRes = await fetch(`https://api.replicate.com/v1/predictions/${repData.id}`, {
                                        headers: { 'Authorization': `Token ${replicateKey}` }
                                    });
                                    const stData = await stRes.json();
                                    if (stData.status === 'succeeded' && stData.output) {
                                        resultImageUrl = Array.isArray(stData.output) ? stData.output[0] : stData.output;
                                        break;
                                    }
                                    if (stData.status === 'failed')
                                        break;
                                }
                            }
                        }
                        catch (repErr) {
                            console.warn('⚠️ Replicate API error:', repErr.message);
                        }
                    }
                    // 3. Tích hợp IDM-VTON AI trực tiếp từ HuggingFace (ZeroGPU)
                    if (!resultImageUrl && pImg && gImg) {
                        try {
                            const hfResult = await callIdmVtonHF(pImg, gImg, garmDesc);
                            if (hfResult) {
                                try {
                                    const dlRes = await fetch(hfResult);
                                    if (dlRes.ok) {
                                        const buf = await dlRes.arrayBuffer();
                                        const saveDir = path.join(process.cwd(), 'public', 'uploads', 'tryon');
                                        await fs.promises.mkdir(saveDir, { recursive: true });
                                        const fileName = `tryon_${Date.now()}.png`;
                                        await fs.promises.writeFile(path.join(saveDir, fileName), Buffer.from(buf));
                                        resultImageUrl = `/uploads/tryon/${fileName}`;
                                        console.log('   💾 Đã lưu ảnh kết quả cục bộ:', resultImageUrl);
                                    }
                                    else {
                                        resultImageUrl = hfResult;
                                    }
                                }
                                catch (dlErr) {
                                    console.warn('   ⚠️ Lỗi cache ảnh IDM-VTON cục bộ:', dlErr.message);
                                    resultImageUrl = hfResult;
                                }
                                provider = 'idm-vton-ai';
                            }
                        }
                        catch (hfErr) {
                            console.warn('⚠️ HF IDM-VTON error:', hfErr.message);
                        }
                    }
                    return { resultUrl: resultImageUrl, provider };
                }
            });
            sendSuccess(res, workflowResult, 'AI Virtual Try-On hoàn tất qua quy trình AI Agent Pipeline!');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Lấy danh sách các Workflows may đo chuyên biệt trong hệ thống
     */
    static async getWorkflows(req, res) {
        const workflows = [
            {
                id: 'tailored_suit_workflow',
                name: 'Quy trình May đo Vest Hoàng Gia (Haute Couture Suit Pipeline)',
                category: 'vest_suit',
                description: 'Tối ưu cho vai đệm, ve áo vest, mô phỏng nếp gấp vải wool và đổ bóng 3D ngực áo.'
            },
            {
                id: 'silk_shirt_workflow',
                name: 'Quy trình Tơ Lụa Cao Cấp (Mulberry Silk Fluidity Pipeline)',
                category: 'silk_shirt',
                description: 'Tối ưu độ rủ tự nhiên của lụa Mulberry, độ ôm sát và đường viền cổ tay áo.'
            },
            {
                id: 'evening_dress_workflow',
                name: 'Quy trình Đầm Dạ Hội Quý Phái (Royal Evening Gown Pipeline)',
                category: 'evening_dress',
                description: 'Tối ưu phom dáng chữ A, eo thon và độ thướt tha của tà váy dài dạ hội.'
            },
            {
                id: 'tailored_pants_workflow',
                name: 'Quy trình Quần Âu May Đo (Tailored Trousers Pipeline)',
                category: 'trousers',
                description: 'Tối ưu đường ly thẳng, tỷ lệ hông - đùi - ống đứng và độ rơi của gấu quần.'
            }
        ];
        sendSuccess(res, workflows, 'Lấy danh sách AI Workflows thành công');
    }
}
//# sourceMappingURL=ai.controller.js.map