import express from 'express';
import cors from 'cors';
import axios from 'axios';
import mongoose from 'mongoose';
import Medicines from './models/schema.js'; 
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/serpapi', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
}

connectDB();

// Define schema

// API Route for medicine search
app.put('/api/search-medicine', async (req, res) => {
  try {
    const { medicineName } = req.body;
    
    if (!medicineName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Medicine name is required' 
      });
    }

    console.log(`🔍 Searching for: ${medicineName}`);
    
    // SerpAPI request
    const serpApiUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(medicineName)}&engine=google_shopping&api_key=958f01834b072d4fffafebd47020d1b388168135598bb4efedec4b033e0e934f&hl=en&gl=in&location=India`;

    const response = await axios.get(serpApiUrl);
    const data = response.data;
   
    // Format the response
    const formattedData = {
      search_information: {
        query_displayed: data.search_metadata?.query || medicineName,
        total_results: data.shopping_results?.length || 0,
      },
      shopping_items: data.shopping_results?.map((item, index) => ({
        position: index + 1,
        title: item.title || 'N/A',
        extracted_price: item.extracted_price || 0,
        source: item.source || 'Unknown',
        link: item.product_link || '#',
        thumbnail: item.thumbnail || '/api/placeholder/100/100',
      })) || [],
    };

    // Sort by price (lowest first)
    formattedData.shopping_items.sort((a, b) => {
      if (a.extracted_price === 0) return 1;
      if (b.extracted_price === 0) return -1;
      return a.extracted_price - b.extracted_price;
    });

    // Save to MongoDB
    const medicineDoc = new Medicines(formattedData);
    await medicineDoc.save();
    
    console.log('✅ Data saved to MongoDB successfully.');

    // Send response to frontend
    res.json({
      success: true,
      data: formattedData,
      message: `Found ${formattedData.shopping_items.length} results for ${medicineName}`
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get search history
app.get('/api/search-history', async (req, res) => {
  try {
    const history = await Medicines.find()
      .sort({ 'search_information.timestamp': -1 })
      .limit(10)
      .select('search_information.query_displayed search_information.timestamp');
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching search history',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;