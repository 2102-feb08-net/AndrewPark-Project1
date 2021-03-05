using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace Storefront.Library
{
    /// <summary>
    /// The order class
    /// </summary>
    public class Order
    {
        private string _location;
        private int _customerId;
        private string _time;
        private List<Product> _products;
        private int _orderId;

        /// <summary>
        /// The class to represent an order by a customer
        /// </summary>
        /// <param name="orderId">The id of the order</param>
        /// <param name="location">The location the order was placed</param>
        /// <param name="customerId">The customer id who placed the order</param>
        /// <param name="time">The date time of the placed order</param>
        public Order(int orderId, string location, int customerId, string time)
        {
            this.Location = location;
            this.CustomerId = customerId;
            _time = time;
            this.OrderId = orderId;
            _products = new List<Product>();
        }

        public Order()
        {

        }

        [Required]
        [Range(0, int.MaxValue,
        ErrorMessage = "Value must be greater than 0")]
        public int CustomerId
        { 
            get { return _customerId; }
            set 
            { 
                if (value <= 0)
                    throw new InvalidOperationException("Customer Id cannot be less than zero.");
                _customerId = value;
            }
        }

        [Required]
        [MinLength(1, ErrorMessage = "Location must not be empty")]
        public string Location
        { 
            get { return _location; }
            set 
            {
                if (!value.All(char.IsLetterOrDigit))
                    throw new InvalidOperationException("Only alphanumeric characters for locations");
                _location = value;
            }
        }

        [Required]
        public string Time
        { 
            get { return _time; }
            set 
            {
                try
                {
                    DateTime.Parse(value);
                    _time = value;
                }
                catch (Exception)
                {
                    _time = DateTime.Now.ToString();
                }
            }
        }

        public int OrderId
        {
            get { return _orderId; }
            set 
            {
                if (value <= 0)
                    throw new InvalidOperationException("Order Id cannot be less than zero.");
                _orderId = value; 
            }
        }

        [Required]
        [MinLength(1, ErrorMessage = "Products must not be empty")]
        public List<Product> Products
        {
            get { return _products; }
            set { _products = value; }
        }

        public void addOrder(Product product)
        {
            _products.Add(product);
        }
    }
}