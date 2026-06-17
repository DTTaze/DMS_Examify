
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<DMS_Examify.Services.IDbConnectionFactory, DMS_Examify.Services.DbConnectionFactory>();
builder.Services.AddScoped<DMS_Examify.Services.ILopService, DMS_Examify.Services.LopService>();
builder.Services.AddScoped<DMS_Examify.Services.ISinhVienService, DMS_Examify.Services.SinhVienService>();
builder.Services.AddScoped<DMS_Examify.Services.IMonHocService, DMS_Examify.Services.MonHocService>();
builder.Services.AddScoped<DMS_Examify.Services.IBoDeService, DMS_Examify.Services.BoDeService>();
builder.Services.AddScoped<DMS_Examify.Services.IGiaoVienService, DMS_Examify.Services.GiaoVienService>();
builder.Services.AddScoped<DMS_Examify.Services.IAuthService, DMS_Examify.Services.AuthService>();


// Thêm Session
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(60);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();

app.UseSession(); // Phải trước UseAuthorization
app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();

app.Run();
