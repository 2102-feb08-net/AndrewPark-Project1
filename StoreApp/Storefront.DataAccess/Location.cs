using System;
using System.Collections.Generic;

#nullable disable

namespace Storefront.DataAccess
{
    public partial class Location
    {
        public Location()
        {
            Inventories = new HashSet<Inventory>();
        }

        public int LocationId { get; set; }
        public string Name { get; set; }

        public virtual ICollection<Inventory> Inventories { get; set; }
    }
}
