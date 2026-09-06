async function testHF() {
  try {
    console.log('Sending test request to yisol-idm-vton...');
    const callRes = await fetch('https://yisol-idm-vton.hf.space/call/tryon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [
          {
            background: {
              path: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800',
              meta: { _type: 'gradio.FileData' }
            },
            layers: [],
            composite: null
          },
          {
            path: 'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?w=800',
            meta: { _type: 'gradio.FileData' }
          },
          'luxury suit jacket',
          true,
          false,
          20,
          42
        ]
      })
    });

    const callData = await callRes.json();
    console.log('Call Response:', callData);

    if (callData.event_id) {
      console.log('Waiting for result with event_id:', callData.event_id);
      const sseRes = await fetch(`https://yisol-idm-vton.hf.space/call/tryon/${callData.event_id}`);
      const text = await sseRes.text();
      console.log('SSE Output length:', text.length);
      console.log('SSE preview:', text.substring(0, 500));
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

testHF();
