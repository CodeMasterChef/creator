import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/data/articles.json');

export interface Article {
    id: string;
    title: string;
    summary: string;
    content: string;
    image: string;
    date: string;
    author: string;
}

export async function getArticles(): Promise<Article[]> {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

export async function saveArticle(article: Article) {
    const articles = await getArticles();
    articles.unshift(article);
    await fs.writeFile(DATA_FILE, JSON.stringify(articles, null, 2));
}
