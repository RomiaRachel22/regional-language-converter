from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from mtranslate import translate

def index(request):
    return render(request, 'index.html')

@csrf_exempt
def translate_text(request):
    if request.method == 'POST':  # Ensure we handle POST requests
        try:
            data = json.loads(request.body)
            text = data.get('text', '')
            source_language = data.get('source_language', 'auto')
            target_language = 'en'

            if text:
                max_chunk_size = 2000
                chunks = [text[i:i + max_chunk_size] for i in range(0, len(text), max_chunk_size)]

                translated_chunks = [translate(chunk, target_language, source_language) for chunk in chunks]
                translated_text = ' '.join(translated_chunks)

                return JsonResponse({'translatedText': translated_text})

            return JsonResponse({'error': 'No text provided'}, status=400)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON request'}, status=400)
        except Exception as e:
            return JsonResponse({'error': f'Translation failed: {str(e)}'}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)
