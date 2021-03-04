using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit;
using Storefront.Library;

namespace Storefront.Test
{
    public class ProductTest
    {
        [Theory]
        [InlineData(1, "Pizza", 13.99, 10)]
        [InlineData(2, "Orange", 2.99, 15)]
        [InlineData(3, "Cheese", 1.99, 20)]
        [InlineData(4, "Water", 15.99, 100)]
        public void testValidProduct(int productId, string name, double price, int amount)
        {
            Product p = new Product(productId, name, price, amount);
        }

        [Theory]
        [InlineData(0, "Pizza", 13.99, 10)]
        [InlineData(1, "$$$$$", 2.99, 15)]
        [InlineData(3, "Cheese", -1.99, 20)]
        [InlineData(4, "Water", 15.99, -100)]
        public void testInvalidProduct(int productId, string name, double price, int amount)
        {
            Product p;
            Assert.ThrowsAny<InvalidOperationException>(() => p = new Product(productId, name, price, amount));
        }
    }
}
