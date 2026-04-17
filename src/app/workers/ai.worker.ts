import { pipeline, env } from '@huggingface/transformers';

// Disable local models since we are running in the browser
env.allowLocalModels = false;

let generator: any = null;
let currentModelId: string | null = null;

self.addEventListener('message', async (event) => {
  const { type, text, systemPrompt, messages, modelId } = event.data;

  if (type === 'load') {
    if (generator && currentModelId === modelId) {
      self.postMessage({ status: 'ready' });
      return;
    }

    try {
      self.postMessage({ status: 'loading', message: `Initializing ${modelId}...` });
      
      // Free up memory if switching models
      if (generator) {
        generator.dispose?.();
        generator = null;
      }

      // Using a highly optimized, small model for browser execution
      generator = await pipeline('text-generation', modelId, {
        progress_callback: (progressInfo: any) => {
          self.postMessage({ status: 'progress', progress: progressInfo });
        }
      });
      
      currentModelId = modelId;
      self.postMessage({ status: 'ready' });
    } catch (error) {
      console.error('Worker Load Error:', error);
      self.postMessage({ status: 'error', error: String(error) });
    }
  }

  if (type === 'generate') {
    if (!generator) {
      self.postMessage({ status: 'error', error: 'Model not loaded' });
      return;
    }

    try {
      self.postMessage({ status: 'generating' });
      
      // Construct chat history
      const chatMessages = [
        { role: 'system', content: systemPrompt },
        ...(messages || []),
        { role: 'user', content: text }
      ];

      // Apply chat template specific to the model
      const prompt = generator.tokenizer.apply_chat_template(chatMessages, {
        tokenize: false,
        add_generation_prompt: true,
      });

      // Generate response
      const result = await generator(prompt, {
        max_new_tokens: 512,
        temperature: 0.7,
        repetition_penalty: 1.1,
        do_sample: true,
      });

      // Extract the generated text (removing the prompt)
      let generatedText = result[0].generated_text;
      if (generatedText.startsWith(prompt)) {
        generatedText = generatedText.slice(prompt.length).trim();
      }
      
      self.postMessage({ status: 'complete', result: generatedText });
    } catch (error) {
      console.error('Worker Generation Error:', error);
      self.postMessage({ status: 'error', error: String(error) });
    }
  }
});
