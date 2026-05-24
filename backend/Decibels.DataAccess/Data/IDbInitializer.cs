using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Decibels.DataAccess.Data
{
    // class responsible for creating Admin and user Roles
    public interface IDbInitializer 
    {
        void Initialize();
    }
}
