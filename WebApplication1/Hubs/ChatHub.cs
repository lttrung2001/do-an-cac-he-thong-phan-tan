using Microsoft.AspNetCore.SignalR;
namespace WebApplication1.Hubs
{
    public class ChatHub : Hub
    {
        public async Task Join(string username)
        {
            string id = Context.ConnectionId;
            await Clients.Client(id).SendAsync("GetOnlines", User.Users);
            await Clients.AllExcept(id).SendAsync("Join", id, username);
            User.Users.Add(new User { Id = id, Name = username });
        }

        public async Task Leave(string username)
        {
            string id = Context.ConnectionId;
            foreach (var user in User.Users)
            {
                if (user.Id == id)
                {
                    User.Users.Remove(user);
                    break;
                }
            }
            await Clients.AllExcept(id).SendAsync("Leave", Context.ConnectionId, username);
        }

        public async Task<Task> OnDisconnected()
        {
            string id = Context.ConnectionId;
            foreach (var user in User.Users)
            {
                if (user.Id == id)
                {
                    User.Users.Remove(user);
                    break;
                }
            }
            await Clients.AllExcept(id).SendAsync("Leave", Context.ConnectionId, "");
            return base.OnDisconnectedAsync(new Exception());
        }

        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        public async Task SendPrivateMessage(string user, string message, string receiverUser)
        {
            foreach (var u in User.Users)
            {
                if (u.Name.ToLower() == receiverUser.ToLower())
                {
                    await Clients.Client(u.Id).SendAsync("PrivateMessage", user, message);
                    break;
                }
            }
        }
    }
    class User
    {
        public string Id { get; set; }
        public string Name { get; set; }

        public static List<User> Users = new List<User>();
    }
}