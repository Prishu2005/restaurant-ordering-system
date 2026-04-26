//pages/RestaurantAdmin.jsx
import MenuPage from "../components/MenuPage";
import AddMenuItem from "../components/AddMenuItem";
import { useParams } from "react-router-dom";

const RestaurantAdmin = () => {
  const { restaurantId } = useParams();

  return (
    <div>
      <h1>Admin Panel</h1>
      <AddMenuItem restaurantId={restaurantId} />
      <hr />
      <MenuPage restaurantId={restaurantId} />
    </div>
  );
};

export default RestaurantAdmin;
