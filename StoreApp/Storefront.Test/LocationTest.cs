using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit;
using Storefront.Library;

namespace Storefront.Test
{
    public class LocationTest
    {
        [Theory]
        [InlineData("CA")]
        [InlineData("TX")]
        [InlineData("WA")]
        public void testValidLocation(string area)
        {
            Location location = new Location(area);
        }

        [Theory]
        [InlineData("$$$")]
        [InlineData("$CA")]
        [InlineData("TX!")]
        public void testInvalidLocations(string area)
        {
            Location l;
            Assert.ThrowsAny<InvalidOperationException>(() => l = new Location(area));
        }
    }
}
