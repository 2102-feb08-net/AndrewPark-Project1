using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using lib = Storefront.Library;

namespace Storefront.DataAccess
{
    public interface IDataRepository
    {

        /// <summary>
        /// Get all the location names
        /// </summary>
        /// <returns>List of all location names as a string</returns>
        public List<string> getLocations();

        /// <summary>
        /// Get a List of Customers
        /// </summary>
        /// <returns>List of Customers</returns>
        public List<lib.Customer> readAllCustomers();

        /// <summary>
        /// Returns a dictionary with locationId and locationName information
        /// </summary>
        /// <returns>Dictionary with LocationId:LocationName as Key/Value</returns>
        public Dictionary<int, string> getLocationDict();

        /// <summary>
        /// Gets a dictionary with all products and their information
        /// </summary>
        /// <returns>Returns a dictionary with ProductId:(ProductName, ProductPrice) as Key/Value</returns>
        public Dictionary<int, (string, double)> getProductInfoDict();

        /// <summary>
        /// Returns all inventory information
        /// </summary>
        /// <returns>Returns a dictionary with LocationName:List<Product> as Key/Value</returns>
        public Dictionary<string, List<lib.Product>> getAllInventory();

        /// <summary>
        /// Returns all orders.
        /// </summary>
        /// <returns>Returns a List of all the stored orders</returns>
        public List<lib.Order> getAllOrders();

        /// <summary>
        /// Returns all customer orders
        /// </summary>
        /// <param name="customerId"></param>
        /// <returns>A filtered List of all orders matching customerId</returns>
        public List<lib.Order> getCustomerOrders(int customerId);

        /// <summary>
        /// Returns all location's orders
        /// </summary>
        /// <param name="location">The location name</param>
        /// <returns>A filtered List of all orders matching the location name</returns>
        public List<lib.Order> getLocationOrders(string location);

        /// <summary>
        /// Saves all the inventory to the database
        /// </summary>
        /// <param name="inventory">The inventory stored as a dictionary with LocationName:List<Product> as its Key/Value</param>
        public void saveAllInventory(Dictionary<string, List<lib.Product>> inventory);

        /// <summary>
        /// Saves the order to the database
        /// </summary>
        /// <param name="order">The checked out order to be saved</param>
        public void saveOrder(lib.Order order);

        /// <summary>
        /// Saves the customer to the database
        /// </summary>
        /// <param name="customer">The customer with changes to be saved</param>
        public void saveCustomer(lib.Customer customer);

        /// <summary>
        /// Adds a new customer to the database
        /// </summary>
        /// <param name="customer">The newly created customer</param>
        public void addCustomer(lib.Customer customer);
    }
}
