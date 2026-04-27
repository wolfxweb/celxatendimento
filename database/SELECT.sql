SELECT
  id,
  title,
  is_indexed,
  embedding IS NOT NULL AS has_embedding,
  index_error,
  last_indexed_at
FROM knowledge_base
ORDER BY updated_at DESC;


SELECT
  id,
  title,
  json_array_length(embedding::json) AS embedding_dimensions
FROM knowledge_base
WHERE embedding IS NOT NULL;
