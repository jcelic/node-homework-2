import express from 'express';
import { prisma } from './prisma.js';

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello' });
});

app.get('/books', async (req, res) => {
  const { author } = req.query;

  const books = author
    ? await prisma.book.findMany({
        where: {
          author: String(author),
        },
      })
    : await prisma.book.findMany();

  res.json(books);
});

app.get('/books/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const bookId = Number(id);

    if (Number.isNaN(bookId)) {
      return res.status(400).json({
        error: 'Invalid book ID',
      });
    }

    const book = await prisma.book.findUniqueOrThrow({
      where: {
        id: bookId,
      },
    });

    res.json(book);
  } catch (error) {
    res.status(404).json({
      error: 'Book not found',
    });
  }
});

app.post('/books', async (req, res) => {
  const { title, author, isbn, price, inStock } = req.body;

  if (!title || !author) {
    return res.status(400).json({
      error: 'Title and author are required',
    });
  }

  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({
      error: 'Price must be positive',
    });
  }

  const book = await prisma.book.create({
    data: {
      title,
      author,
      isbn,
      price,
      inStock,
    },
  });

  res.status(201).json(book);
});

app.put('/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, isbn, price, inStock } = req.body;

    const bookId = Number(id);

    if (Number.isNaN(bookId)) {
      return res.status(400).json({
        error: 'Invalid book ID',
      });
    }

    if (!title || !author) {
      return res.status(400).json({
        error: 'Title and author are required',
      });
    }

    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({
        error: 'Price must be positive',
      });
    }

    const book = await prisma.book.update({
      where: {
        id: bookId,
      },
      data: {
        title,
        author,
        isbn,
        price,
        inStock,
      },
    });

    res.json(book);
  } catch (error) {
    res.status(404).json({
      error: 'Book not found',
    });
  }
});

app.delete('/books/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const bookId = Number(id);

    if (Number.isNaN(bookId)) {
      return res.status(400).json({
        error: 'Invalid book ID',
      });
    }

    await prisma.book.delete({
      where: {
        id: bookId,
      },
    });

    res.status(204).send();
  } catch (error) {
    res.status(404).json({
      error: 'Book not found',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server on :${PORT}`);
});
