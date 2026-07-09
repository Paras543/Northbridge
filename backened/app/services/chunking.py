"""
Chunks the text
"""

def chunk_text(text:str,chunk_size:1000,overlap:200) -> list[str]:
    text = text.strip
    if not text:
        return []
    if chunk_size <= overlap:
        return ValueError("Chunksize must be less than the Overlap size")
    
    chunks=[]
    start = 0
    text_lenght = len(text)

    while start <text_lenght:
        end = chunk_size + overlap
        chunk = text[start:end].strip
        if chunk:
            chunks.append(chunk)
        start += chunk_size - overlap
    

    return chunks
    
