using Decibels.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Decibels.DataAccess.Repository.IRepository
{
    public interface IOrderHeaderRepository : IRepository<OrderHeader>
    {
        void Update(OrderHeader obj);
        // during update of orderStatus, paymentStatus usually stays the same, so it can be nullable
        // get order based on OrderHeader id and update the fields based on it
        void UpdateStatus(int id, string orderStatus, string? paymentStatus = null);
        // sessionId is generated when user tries to make a payment, which generates paymentIntentId
        void UpdateStripePaymentId(int id, string sessionId, string paymentIntentId);
    }
}
