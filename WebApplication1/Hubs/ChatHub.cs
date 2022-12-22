using Microsoft.AspNetCore.SignalR;
using Microsoft.Data.SqlClient;
using System.Text.Json;
namespace WebApplication1.Hubs
{
    public class ChatHub : Hub
    {
        //private string connectionString = @"Data Source=DESKTOP-4UNL892;Initial Catalog=CHTPT;User ID=sa;Password=tt;Encrypt=False;TrustServerCertificate=False";
        private string connectionString = @"Server=192.168.0.254;Database=CHTPT;User ID=sa;Password=tt;Encrypt=False;TrustServerCertificate=False";
        public Boolean Join(string username, string password)
        {
            SqlConnection connection = new SqlConnection(connectionString);
            connection.Open();
            SqlCommand cmd = new SqlCommand(String.Format("SELECT COUNT(*) FROM USERINFO WHERE username='{0}' AND password='{1}'", username, password), connection);
            SqlDataReader reader = cmd.ExecuteReader();
            reader.Read();
            bool isCorrect = reader.GetInt32(0) > 0;
            reader.Close();
            if (isCorrect)
            {
                string id = Context.ConnectionId;
                cmd = new SqlCommand(String.Format("UPDATE USERINFO SET isOnline=1, connectionId='{0}' WHERE username='{1}'", id, username), connection);
                cmd.ExecuteNonQuery();
                reader.Close();
                //Clients.Client(id).SendAsync("GetOnlines", users);
                Clients.AllExcept(id).SendAsync("Join", id, username);
                return true;
            }
            else
            {
                return false;
            }
        }

        public string GetOnlines(string username)
        {
            SqlConnection connection = new SqlConnection(connectionString);
            connection.Open();
            SqlCommand cmd = new SqlCommand(String.Format("SELECT connectionId, username FROM USERINFO WHERE isOnline=1 and username != '{0}'", username), connection);
            SqlDataReader reader = cmd.ExecuteReader();
            List<User> users = new List<User>();
            while (reader.Read())
            {
                users.Add(new User { Id = reader.GetString(0), Name = reader.GetString(1) });
            }
            reader.Close();
            return JsonSerializer.Serialize(users);
        }

        public async Task Leave(string username)
        {
            string id = Context.ConnectionId;
            SqlConnection connection = new SqlConnection(connectionString);
            connection.Open();
            SqlCommand cmd = new SqlCommand(String.Format("UPDATE USERINFO SET isOnline=0, connectionId='' WHERE username='{0}'", username), connection);
            cmd.ExecuteNonQuery();
            await Clients.AllExcept(id).SendAsync("Leave", Context.ConnectionId, username);
        }

        public async Task<Task> OnDisconnected()
        {
            string id = Context.ConnectionId;
            SqlConnection connection = new SqlConnection(connectionString);
            connection.Open();
            SqlCommand cmd = new SqlCommand(String.Format("UPDATE USERINFO SET isOnline=0, connectionId='' WHERE connectionId='{0}'", id), connection);
            cmd.ExecuteNonQuery();
            await Clients.AllExcept(id).SendAsync("Leave", Context.ConnectionId);
            return base.OnDisconnectedAsync(new Exception());
        }

        public async Task SendMessage(string message, string receiverId)
        {
            String id = Context.ConnectionId;
            SqlConnection connection = new SqlConnection(connectionString);
            connection.Open();
            SqlCommand cmd = new SqlCommand(String.Format("SELECT username FROM USERINFO WHERE connectionId='{0}'", id), connection);
            SqlDataReader reader = cmd.ExecuteReader();
            reader.Read();
            String name = reader.GetString(0);
            Console.WriteLine(name);
            reader.Close();
            if (receiverId.Equals("group"))
            {
                await Clients.All.SendAsync("ReceiveMessage", id, name, message, receiverId);
            }
            else
            {
                await Clients.Client(receiverId).SendAsync("ReceiveMessage", id, name, message, receiverId);
                await Clients.Client(id).SendAsync("ReceiveMessage", id, name, message, receiverId);
            }
        }
        class User
        {
            public string Id { get; set; }
            public string Name { get; set; }

            public string Password { get; set; }

            public bool isOnline { get; set; }
        }
    }
}