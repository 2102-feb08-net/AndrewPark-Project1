using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using lib = Storefront.Library;
using System.IO;

namespace Storefront.DataAccess
{
    /// <summary>
    /// The Storefront data respository that handles retrieving/storing information to the database 
    /// </summary>
    public class StoreRespository : IDataRepository
    {
        private readonly StoreDBContext _context;

        /// <summary>
        /// Returns the options for the DBContext
        /// </summary>
        /// <param name="options">The DBContext options</param>
        public StoreRespository(StoreDBContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get all the location names
        /// </summary>
        /// <returns>List of all location names as a string</returns>
        public List<string> getLocations()
        {
            return getAllInventory().Keys.ToList();
        }

        /// <summary>
        /// Get a List of Customers
        /// </summary>
        /// <returns>List of Customers</returns>
        public List<lib.Customer> readAllCustomers()
        {
            var customers = new List<lib.Customer>();
            try
            {
                foreach (var customerLine in _context.Customers)
                {
                    customers.Add(new lib.Customer(customerLine.CustomerId, customerLine.FirstName, customerLine.LastName, customerLine.Balance));
                }
            }
            catch (Exception e)
            {
                return customers;
            }
            return customers;
        }

        /// <summary>
        /// Returns a dictionary with locationId and locationName information
        /// </summary>
        /// <returns>Dictionary with LocationId:LocationName as Key/Value</returns>
        public Dictionary<int, string> getLocationDict()
        {
            var locationDict = new Dictionary<int, string>();
            try
            {
                foreach (var locationLine in _context.Locations)
                {
                    if (!locationDict.ContainsKey(locationLine.LocationId))
                        locationDict.Add(locationLine.LocationId, locationLine.Name);
                }
            }
            catch (Exception e)
            {
                return locationDict;
            }
            return locationDict;
        }

        /// <summary>
        /// Gets a dictionary with all products and their information
        /// </summary>
        /// <returns>Returns a dictionary with ProductId:(ProductName, ProductPrice) as Key/Value</returns>
        public Dictionary<int, (string, double)> getProductInfoDict()
        {
            var productDict = new Dictionary<int, (string, double)>();
            try
            {
                foreach (var productLine in _context.Products)
                {
                    if (!productDict.ContainsKey(productLine.ProductId))
                    {
                        productDict.Add(productLine.ProductId, (productLine.Name, productLine.Price));
                    }
                }
            }
            catch (Exception e)
            {
                return productDict;
            }
            return productDict;
        }

        /// <summary>
        /// Returns all inventory information
        /// </summary>
        /// <returns>Returns a dictionary with LocationName:List<Product> as Key/Value</returns>
        public Dictionary<string, List<lib.Product>> getAllInventory()
        {
            var storeInventory = new Dictionary<string, List<lib.Product>>();
            try
            {
                var locationDict = getLocationDict();
                var productDict = getProductInfoDict();

                foreach (var inventoryLine in _context.Inventories)
                {
                    var locationId = locationDict[inventoryLine.LocationId];
                    if (!storeInventory.ContainsKey(locationId))
                    {
                        storeInventory.Add(locationId, new List<lib.Product>());
                    }
                    var productId = inventoryLine.ProductId;
                    storeInventory[locationId].Add(new lib.Product(productId, productDict[productId].Item1, productDict[productId].Item2, inventoryLine.Amount));
                }
            }
            catch (Exception e)
            {
                return storeInventory;
            }

            return storeInventory;
        }

        /// <summary>
        /// Returns all orders.
        /// </summary>
        /// <returns>Returns a List of all the stored orders</returns>
        public List<lib.Order> getAllOrders()
        {
            var ordersDict = new Dictionary<int, lib.Order>();
            try
            {
                var locationDict = getLocationDict();

                var data = _context.OrderLines.Include(o => o.Product).Include(o => o.Order);

                foreach (var orderline in data)
                {
                    var orderId = orderline.OrderId;
                    if (!ordersDict.ContainsKey(orderId))
                        ordersDict.Add(orderline.OrderId, new lib.Order(orderId, locationDict[orderline.Order.LocationId], orderline.Order.CustomerId, orderline.Order.OrderTime));
                    ordersDict[orderId].addOrder(new lib.Product(orderline.ProductId, orderline.Product.Name, orderline.Product.Price, orderline.Amount));
                }
            }
            catch (Exception)
            {
                return ordersDict.Values.ToList();
            }
            return ordersDict.Values.ToList();
        }

        /// <summary>
        /// Returns all customer orders
        /// </summary>
        /// <param name="customerId"></param>
        /// <returns>A filtered List of all orders matching customerId</returns>
        public List<lib.Order> getCustomerOrders(int customerId)
        {
            List<lib.Order> allOrders = getAllOrders();
            return allOrders.Where((order) => order.CustomerId == customerId).ToList();
        }

        /// <summary>
        /// Returns all location's orders
        /// </summary>
        /// <param name="location">The location name</param>
        /// <returns>A filtered List of all orders matching the location name</returns>
        public List<lib.Order> getLocationOrders(string location)
        {
            List <lib.Order> allOrders = getAllOrders();
            return allOrders.Where((order) => order.Location == location).ToList();
        }

        /// <summary>
        /// Saves all the inventory to the database
        /// </summary>
        /// <param name="inventory">The inventory stored as a dictionary with LocationName:List<Product> as its Key/Value</param>
        public void saveAllInventory(Dictionary<string, List<lib.Product>> inventory)
        {
            try
            {
                foreach (var dataProduct in _context.Inventories.Include(i => i.Location).Include(i => i.Product))
                {
                    dataProduct.Amount = inventory[dataProduct.Location.Name]
                        .Where(prod => prod.ProductId == dataProduct.ProductId)
                        .FirstOrDefault()
                        .Amount;
                    _context.Update(dataProduct);
                }
                _context.SaveChanges();
            }
            catch (Exception)
            {
                Console.WriteLine("Error creating new orders");
            }
        }

        /// <summary>
        /// Saves the order to the database
        /// </summary>
        /// <param name="order">The checked out order to be saved</param>
        public void saveOrder(lib.Order order)
        {
            try
            {
                var locationDict = getLocationDict();

                var dataOrder = new DataAccess.Order();
                var dataCustomer = _context.Customers.Where(c => c.CustomerId == order.CustomerId).FirstOrDefault();
                dataOrder.CustomerId = order.CustomerId;
                dataOrder.OrderTime = order.Time;
                dataOrder.LocationId = _context.Locations.Where(l => l.Name == order.Location).Select(l => l.LocationId).FirstOrDefault();
                _context.Add(dataOrder);
                _context.SaveChanges();

                foreach (var p in order.Products)
                {
                    var dataOrderLine = new DataAccess.OrderLine();
                    dataOrderLine.OrderId = dataOrder.OrderId;
                    dataOrderLine.ProductId = p.ProductId;
                    dataOrderLine.Amount = p.Amount;
                    dataCustomer.Balance -= p.Amount * p.Price;
                    _context.Add(dataOrderLine);
                }
                _context.Update(dataCustomer);
                _context.SaveChanges();
            }
            catch (Exception)
            {
                Console.WriteLine("Error creating new orders");
            }
        }

        /// <summary>
        /// Adds a new customer to the database
        /// </summary>
        /// <param name="customer">The newly created customer</param>
        public void addCustomer(lib.Customer customer)
        {
            try
            {
                var dataCustomer = new DataAccess.Customer();
                dataCustomer.Balance = customer.Balance;
                dataCustomer.FirstName = customer.FirstName;
                dataCustomer.LastName = customer.LastName;
                _context.Add(dataCustomer);
                _context.SaveChanges();
            }
            catch (Exception)
            {
                Console.WriteLine("Error saving customer.");
            }

        }
    }
}
