using Decibels.DataAccess.Repository;
using Decibels.DataAccess.Repository.IRepository;
using Decibels.Utility;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DecibelsWeb.ViewComponents
{
    // class for displaying shopping cart's status pages by using session (like ViewModels but on all pages)

    public class ShoppingCartViewComponent : ViewComponent
    {
        private readonly IUnitOfWork _unitOfWork;

        public ShoppingCartViewComponent(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IViewComponentResult> InvokeAsync()
        {
            var claimsIdentity = (ClaimsIdentity)User.Identity;
            var claim = claimsIdentity.FindFirst(ClaimTypes.NameIdentifier);

            if (claim != null)
            {
                if (HttpContext.Session.GetInt32(StaticDetails.SessionCart) == null) {
                    HttpContext.Session.SetInt32(StaticDetails.SessionCart,
                        _unitOfWork.ShoppingCart.GetAll(u => u.ApplicationUserId == claim.Value).Count());
                }

                // user logged in
                return View(HttpContext.Session.GetInt32(StaticDetails.SessionCart));
            }
            else
            {
                HttpContext.Session.Clear(); // clear cart on logout
                return View(0);
            }
        }
    }
}
