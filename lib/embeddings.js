import { CohereClient } from 'cohere-ai'

const cohere = new CohereClient({ token: process.env.COHERE_API_KEY })

export const generateEmbedding = async (text) => {
    const response = await cohere.embed({
        texts: [text],
        model: 'embed-english-v3.0',
        inputType: 'search_query',
    })
    return response.embeddings[0]
}

export const generateDocumentEmbeddings = async (texts) => {
    const response = await cohere.embed({
        texts,
        model: 'embed-english-v3.0',
        inputType: 'search_document',
    })
    return response.embeddings
}

export const cosineSimilarity = (vecA, vecB) => {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0)
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0))
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0))
    return dotProduct / (magnitudeA * magnitudeB)
}
