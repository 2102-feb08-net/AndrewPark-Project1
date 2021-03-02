using System;
using System.Collections.Generic;

#nullable disable

namespace Storefront.DataAccess
{
    public partial class Customer
    {
        public Customer()
        {
            Orders = new HashSet<Order>();
        }

        public int CustomerId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public double Balance { get; set; }

        public virtual ICollection<Order> Orders { get; set; }
    }
}
