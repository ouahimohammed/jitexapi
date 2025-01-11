const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
require('dotenv').config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();

// Activer CORS pour toutes les origines
app.use(cors());

// Middleware pour analyser les données JSON
app.use(express.json());
const corsOptions = {
  origin: 'https://jitex.vercel.app', // Autoriser uniquement ce domaine
  methods: ['GET', 'POST'], // Autoriser les méthodes HTTP nécessaires
  allowedHeaders: ['Content-Type'], // Autoriser les en-têtes nécessaires
};

app.use(cors(corsOptions)); // Appliquer cette configuration
app.options('/api/checkout', cors(corsOptions)); // Autoriser les requêtes OPTIONS


const vols = [
  { id: 1, villedepart: "Casablanca", villearrivee: "Paris", prix: 1500, date: "15-01-2025", image: "plane1.jpg", services: [] },
  { id: 2, villedepart: "Rabat", villearrivee: "Madrid", prix: 1300, date: "13-01-2025", image: "plane2.jpg", services: [] },
  { id: 3, villedepart: "Fes", villearrivee: "Moscou", prix: 5000, date: "05-02-2025", image: "plane3.jpg", services: [] },
  { id: 4, villedepart: "Tanger", villearrivee: "Londres", prix: 1800, date: "25-03-2025", image: "plane4.jpg", services: [] },
  { id: 5, villedepart: "Agadir", villearrivee: "Berlin", prix: 2000, date: "22-01-2025", image: "plane5.jpg", services: [] },
  { id: 6, villedepart: "Oujda", villearrivee: "Doha", prix: 2000, date: "18-01-2025", image: "plane5.jpg", services: [] }
];

// Route pour récupérer tous les vols
app.get('/api/vols', (req, res) => {
  res.json(vols);
});

// Route pour récupérer un vol spécifique par ID
app.get('/api/vols/:id', (req, res) => {
  const vol = vols.find(v => v.id === parseInt(req.params.id));
  if (!vol) {
    return res.status(404).send('Vol non trouvé');
  }
  res.json(vol);
});

// Route pour créer un Payment Intent avec Stripe
app.post('/api/checkout', async (req, res) => {
  const { amount, currency = 'mad', description, fullName } = req.body;

  if (!fullName) {
    return res.status(400).json({ error: 'Le nom complet est requis' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convertir le montant en centimes
      currency,
      description,
      payment_method_types: ['card'],
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Erreur lors de la création du Payment Intent:', error);
    res.status(500).json({ error: 'Une erreur est survenue lors du traitement du paiement' });
  }
});

// Exporter l'application Express comme handler pour Vercel
module.exports = app;
