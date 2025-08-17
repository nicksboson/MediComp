import mongoose from 'mongoose';
    
    // Define schema

    const medicinesSchema = new mongoose.Schema({
      search_information: {
        query_displayed: String,
        total_results: Number,
      },
      shopping_items: [{
        position: Number,
        title: String,
        extracted_price: Number,
        source: String,
        link: String,
        thumbnail: String,
      }],
    });

    export default mongoose.model('Medicines', medicinesSchema);
 