
export interface Book {
  id: string; 
  userId: string;
  slug: string;
  title: string;
  coverImage: string; // URL
  content: string; // HTML content for the entire story
  createdAt: number;
  updatedAt: number;
  drawingUrl?: string | null; // URL to the drawing in Firebase Storage
}
