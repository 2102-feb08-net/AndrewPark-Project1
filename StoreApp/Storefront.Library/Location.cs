using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Storefront.Library
{
    /// <summary>
    /// The class to represent the location and it's inventory
    /// </summary>
    public class Location
    {
        private string _location;
        private Dictionary<int, int> _cart;

        public string CurrentLocation
        {
            get
            {
                return _location;
            }
            set
            {
                if (!value.All(char.IsLetterOrDigit))
                    throw new InvalidOperationException("Only alphanumeric characters for locations");
                _location = value;
            }
        }

        public Location()
        {
            _cart = new Dictionary<int, int>();
        }

        public Location(string location)
        {
            this.CurrentLocation = location;
            _cart = new Dictionary<int,int>();
        }

        public Dictionary<int, int> Cart
        { 
            get { return _cart; }
            set { _cart = value; }
        }

        /// <summary>
        /// Add an item to the location's cart
        /// </summary>
        /// <param name="productId">The product id of the product being placed in the cart</param>
        /// <param name="amount">The amount of the product being ordered</param>
        /// <param name="inventory">The dictionary inventory of how many products are in the store</param>
        public void addToCart(int productId, int amount, Dictionary<int, Product> inventory)
        {
            if (!inventory.ContainsKey(productId) || amount > 50)
            {
                throw new ArgumentException("Invalid product or amount.");
            }
            if (!_cart.ContainsKey(productId))
                _cart.Add(productId, 0);
            _cart[productId] += amount;
        }

        /// <summary>
        /// Clear the cart of all it's products
        /// </summary>
        public void clearCart()
        {
            _cart = new Dictionary<int, int>();
        }

        /// <summary>
        /// Checkout the items placed in the cart
        /// </summary>
        /// <param name="orders">A list of all the current orders</param>
        /// <param name="customer">The customer who placed the orders</param>
        /// <param name="inventory">The current inventory of the location</param>
        /// <returns></returns>
        public Order checkout(List<Order> orders, Customer customer, Dictionary<int, Product> inventory)
        {
            if (_cart.Count == 0)
                throw new ArgumentException("Cart is empty");

            double totalPrice = 0.0;
            foreach (var cartProduct in _cart)
            {
                if (cartProduct.Value > inventory[cartProduct.Key].Amount)
                    throw new ArgumentException("Ordered more than stock.");
                totalPrice += inventory[cartProduct.Key].Price * cartProduct.Value;
            }

            if (totalPrice > customer.Balance)
                throw new ArgumentException("Not enough balance on customer.");
            customer.Balance -= totalPrice;

            Order finalOrder;
            if (orders.Count == 0)
                finalOrder = new Order(0, _location, customer.CustomerId, DateTime.Now);
            else
                finalOrder = new Order(orders.Select((order) => order.OrderId).Max() + 1, _location, customer.CustomerId, DateTime.Now);
            foreach (var cartProduct in _cart)
            {
                inventory[cartProduct.Key].Amount -= cartProduct.Value;
                var inventoryProduct = inventory[cartProduct.Key];
                finalOrder.addOrder(new Product(cartProduct.Key, inventoryProduct.Name, inventoryProduct.Price, cartProduct.Value));
            }
            orders.Add(finalOrder);
            clearCart();
            return finalOrder;

        }
    }
}
