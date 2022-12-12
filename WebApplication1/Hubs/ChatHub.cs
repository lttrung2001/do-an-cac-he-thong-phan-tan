using Microsoft.AspNetCore.SignalR;
namespace WebApplication1.Hubs
{
    public class ChatHub : Hub
    {
        public async Task<Task> OnConnected()
        {
            await Clients.All.SendAsync("NewConnection", Context.ConnectionId);
            return base.OnConnectedAsync();
        }

        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        public async Task SendPrivateMessage(string user, string message, string receiver)
        {
            await Clients.Client(receiver).SendAsync("PrivateMessage", user, message);
        }
    }
}