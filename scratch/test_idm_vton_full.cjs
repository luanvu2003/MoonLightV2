const fs = require('fs');

async function run() {
  try {
    console.log('1. Uploading test human photo...');
    const testImgPath = '/Users/luan/.gemini/antigravity-ide/brain/91e18c30-8a86-4a11-b1ea-d9aa5a4bab6a/.user_uploaded/media_1788667806651.png';
    const blob = new Blob([fs.readFileSync(testImgPath)], { type: 'image/png' });
    const formData = new FormData();
    formData.append('files', blob, 'person.png');

    const upRes = await fetch('https://yisol-idm-vton.hf.space/upload', {
      method: 'POST',
      body: formData
    });
    const upPaths = await upRes.json();
    console.log('Human upload path:', upPaths[0]);

    console.log('2. Uploading garment photo (suit jacket)...');
    // Fetch a real garment image
    const garmBlob = await (await fetch('https://images.unsplash.com/photo-1598808503746-f34c53b9323e?w=800&auto=format&fit=crop&q=80')).blob();
    const garmForm = new FormData();
    garmForm.append('files', garmBlob, 'garment.jpg');
    const garmUpRes = await fetch('https://yisol-idm-vton.hf.space/upload', {
      method: 'POST',
      body: garmForm
    });
    const garmPaths = await garmUpRes.json();
    console.log('Garment upload path:', garmPaths[0]);

    console.log('3. Calling /call/tryon...');
    const callRes = await fetch('https://yisol-idm-vton.hf.space/call/tryon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [
          {
            background: {
              path: upPaths[0],
              meta: { _type: 'gradio.FileData' }
            },
            layers: [],
            composite: null
          },
          {
            path: garmPaths[0],
            meta: { _type: 'gradio.FileData' }
          },
          'luxury formal suit jacket',
          true,
          false,
          20,
          42
        ]
      })
    });
    const { event_id } = await callRes.json();
    console.log('Waiting on event_id:', event_id);

    const sseRes = await fetch(`https://yisol-idm-vton.hf.space/call/tryon/${event_id}`);
    const text = await sseRes.text();
    console.log('Result text:', text);

    const match = text.match(/https:\/\/yisol-idm-vton\.hf\.space\/file=[^\s",]+/);
    if (match) {
      console.log('SUCCESS! Real try-on image:', match[0]);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
