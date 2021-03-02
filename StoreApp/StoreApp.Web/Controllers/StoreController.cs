using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Storefront.DataAccess;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.IO;
using lib = Storefront.Library;

namespace StoreApp.Web.Controllers
{
    [ApiController]
    public class StoreController : ControllerBase
    {
        private readonly IDataRepository _dataRepository;
        public StoreController()
        {
            string dir = Directory.GetCurrentDirectory();
            string connectionString = System.IO.File.ReadAllText(dir + "\\StoreDB-ConnectionString.txt");
            _dataRepository = new StoreRespository(StoreRespository.createStoreOptions(connectionString));
        }

        [HttpGet("api/customers")]
        public IEnumerable<lib.Customer> getCustomers()
        {
            return _dataRepository.readAllCustomers();
        }

        [HttpGet("api/orders")]
        public IEnumerable<lib.Order> getOrders()
        {
            return _dataRepository.getAllOrders();
        }

        [HttpGet("api/locations")]
        public IEnumerable<string> getLocations()
        {
            return _dataRepository.getLocations();
        }

        [HttpGet("api/inventory")]
        public Dictionary<string, List<lib.Product>> getInventory()
        {
            return _dataRepository.getAllInventory();
        }
    }
}
