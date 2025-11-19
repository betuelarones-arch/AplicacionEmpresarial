import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

def recomendar(producto_obj, todos_productos, top_n=4):
    """Recomienda productos similares usando embeddings."""
    if not producto_obj.embedding:
        return []

    producto_vec = np.array(producto_obj.embedding).reshape(1, -1)
    embeddings = np.array([p.embedding for p in todos_productos])
    
    similitudes = cosine_similarity(producto_vec, embeddings)
    indices_ordenados = np.argsort(similitudes[0])[::-1]  # de mayor a menor
    recomendados = [todos_productos[i] for i in indices_ordenados if todos_productos[i] != producto_obj][:top_n]
    return recomendados
