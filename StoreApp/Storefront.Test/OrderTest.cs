using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit;
using Storefront.Library;

namespace Storefront.Test
{
    public class OrderTest
    {
        [Theory]
        [InlineData(1, "CA", 1, 2021, 1, 1)]
        [InlineData(2, "TX", 2, 2021, 2, 5)]
        [InlineData(3, "WA", 2, 2021, 3, 15)]
        public void testValidOrder(int orderId, string location, int customerId, int year, int month, int day)
        {
            DateTime date = new DateTime(year, month, day);
            Order order = new Order(orderId, location, customerId, date);
        }

        [Theory]
        [InlineData(0, "CA", 1, 2021, 1, 1)]
        [InlineData(1, "TX@", 2, 2021, 2, 5)]
        [InlineData(3, "WA", 0, 2021, 3, 15)]
        public void testInvalidOrder(int orderId, string location, int customerId, int year, int month, int day)
        {
            DateTime date = new DateTime(year, month, day);
            Order order;
            Assert.ThrowsAny<InvalidOperationException>(() => order = new Order(orderId, location, customerId, date));
        }
    }
}
