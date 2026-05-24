using Microsoft.AspNetCore.Identity.UI.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Decibels.Utility
{
    public class EmailSender : IEmailSender
    {
        /*
         * Implementation/logic to send email created temporarily to solve issue of inability to Register new user
         * where in the Register Razor page's OnPostAsync() _emailSender is injected
         * because in Program.cs a custom implementation of Identity instead of the original AddDefaultIdentity
         */
        public Task SendEmailAsync(string email, string subject, string htmlMessage)
        {
            return Task.CompletedTask;
        }
    }
}
