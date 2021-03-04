using Storefront.Library;
using System;
using Xunit;

namespace Storefront.Test
{
    public class CustomerTest
    {
        [Theory]
        [InlineData(1, "TestFirst", "TestLast", 100)]
        [InlineData(2, "TESTFIRST", "TESTLAST", 100)]
        [InlineData(3, "testfirst", "testlast", 100)]
        public void TestValidCustomerInfo(int customerId, string first, string last, double balance)
        {
            Customer customer = new Customer(customerId, first, last, balance);
        }

        [Theory]
        [InlineData(1, "$$$$", "validLast", 100)]
        [InlineData(2, "validFirst", "$$$$", 100)]
        [InlineData(3, "validFirst", "validLast", -10)]
        [InlineData(0, "validFirst", "validLast", 10)]
        public void TestInvalidCustomerInfo(int customerId, string first, string last, double balance)
        {
            Customer customer;
            Assert.ThrowsAny<InvalidOperationException>(() => customer = new Customer(customerId, first, last, balance));
        }
    }
}
