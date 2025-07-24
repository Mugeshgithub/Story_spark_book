/**
 * @fileOverview A service to interact with (simulated) Amazon book data.
 */

// This is a mocked service. In a real-world application, this would
// make an API call to a backend that scrapes or uses the Amazon Product API.

interface Book {
  title: string;
  author: string;
  url: string;
}

const topBooks: Book[] = [
    {
        title: "The Women",
        author: "Kristin Hannah",
        url: "https://www.amazon.com/dp/1250178630/"
    },
    {
        title: "Fourth Wing",
        author: "Rebecca Yarros",
        url: "https://www.amazon.com/dp/1649374046/"
    },
    {
        title: "Iron Flame",
        author: "Rebecca Yarros",
        url: "https://www.amazon.com/dp/1649374178/"
    },
    {
        title: "A Court of Thorns and Roses",
        author: "Sarah J. Maas",
        url: "https://www.amazon.com/dp/1619634449/"
    },
    {
        title: "Funny Story",
        author: "Emily Henry",
        url: "https://www.amazon.com/dp/0593441281/"
    }
];

export async function getTopSellingBooks(): Promise<Book[]> {
  // Simulate a network request delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return topBooks;
}
