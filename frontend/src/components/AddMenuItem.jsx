// components/AddMenuitems.jsx
import { useState } from "react";
import axios from "axios";

const AddMenuItem = ({ restaurantId }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://restaurant-backend-6lre.onrender.com/api/menu", {
        ...form,
        restaurantId
      });
      alert("Item added!");
    } catch (err) {
      console.error("Failed to add item", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Item Name" onChange={handleChange} required />
      <input name="description" placeholder="Description" onChange={handleChange} required />
      <input name="price" type="number" placeholder="Price" onChange={handleChange} required />
      <input name="category" placeholder="Category" onChange={handleChange} required />
      <button type="submit">Add Item</button>
    </form>
  );
};

export default AddMenuItem;
