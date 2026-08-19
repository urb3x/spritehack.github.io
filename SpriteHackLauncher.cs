using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Threading.Tasks;

namespace SpriteHackLauncher
{
    public class Program
    {
        [STAThread]
        public static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12 | SecurityProtocolType.Tls11 | SecurityProtocolType.Tls;
            Application.Run(new MainForm());
        }
    }

    public class MainForm : Form
    {
        private TextBox txtUsername;
        private RadioButton rb1204;
        private RadioButton rb189;
        private TrackBar sliderRam;
        private Label lblRamVal;
        private ProgressBar progressBar;
        private Label lblStatus;
        private Label lblJavaInfo;
        private Button btnLaunch;
        private Button btnLaunchJava;
        private string detectedJavaPath = "";

        public MainForm()
        {
            this.Text = "SpriteHack v3.5 - Wurst-Style Client & Launcher";
            this.Size = new Size(820, 600);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.BackColor = Color.FromArgb(15, 16, 21);
            this.ForeColor = Color.FromArgb(243, 244, 246);
            this.Font = new Font("Segoe UI", 10, FontStyle.Regular);

            DetectSystemJava();
            InitUI();
        }

        private void DetectSystemJava()
        {
            string[] possiblePaths = new string[] {
                @"C:\Program Files\Pylo\MCreator\jdk\bin\java.exe",
                @"C:\Program Files\JetBrains\PyCharm 2024.1.4\jbr\bin\java.exe",
                @"C:\Program Files\JetBrains\PyCharm Community Edition 2024.1.4\jbr\bin\java.exe",
                @"C:\Program Files\Eclipse Adoptium\jdk-17.0.10.7-hotspot\bin\java.exe",
                @"C:\Program Files\Java\jdk-17\bin\java.exe",
                @"C:\Program Files\Java\jdk-21\bin\java.exe",
                "java.exe"
            };

            foreach (string p in possiblePaths)
            {
                if (p == "java.exe" || File.Exists(p))
                {
                    detectedJavaPath = p;
                    break;
                }
            }
        }

        private void InitUI()
        {
            // Header Panel (Wurst Style)
            Panel headerPanel = new Panel();
            headerPanel.Dock = DockStyle.Top;
            headerPanel.Height = 85;
            headerPanel.BackColor = Color.FromArgb(24, 25, 32);
            headerPanel.Paint += (s, e) =>
            {
                using (Pen pen = new Pen(Color.FromArgb(16, 185, 129), 3))
                {
                    e.Graphics.DrawLine(pen, 0, headerPanel.Height - 2, headerPanel.Width, headerPanel.Height - 2);
                }
            };

            Label lblLogo = new Label();
            lblLogo.Text = "⚡ SPRITEHACK [WURST-STYLE EDITION]";
            lblLogo.Font = new Font("Segoe UI", 16, FontStyle.Bold);
            lblLogo.ForeColor = Color.White;
            lblLogo.Location = new Point(25, 16);
            lblLogo.AutoSize = true;
            headerPanel.Controls.Add(lblLogo);

            Label lblSub = new Label();
            lblSub.Text = "Menu Hacków: PRAWY SHIFT (Right Shift) | TabGUI: STRZAŁKI | Wallhack & Aimbot";
            lblSub.Font = new Font("Segoe UI", 9.5F, FontStyle.Bold);
            lblSub.ForeColor = Color.FromArgb(16, 185, 129);
            lblSub.Location = new Point(27, 50);
            lblSub.AutoSize = true;
            headerPanel.Controls.Add(lblSub);

            this.Controls.Add(headerPanel);

            // Main Body Container
            Panel bodyPanel = new Panel();
            bodyPanel.Location = new Point(25, 105);
            bodyPanel.Size = new Size(755, 435);
            bodyPanel.BackColor = Color.FromArgb(20, 22, 30);
            bodyPanel.Padding = new Padding(20);

            // 1. Username
            Label lblUser = new Label();
            lblUser.Text = "NICK (CRACKED / OFFLINE):";
            lblUser.Font = new Font("Segoe UI", 9, FontStyle.Bold);
            lblUser.ForeColor = Color.FromArgb(16, 185, 129);
            lblUser.Location = new Point(20, 20);
            lblUser.AutoSize = true;
            bodyPanel.Controls.Add(lblUser);

            txtUsername = new TextBox();
            txtUsername.Text = "SpriteHacker";
            txtUsername.Font = new Font("Segoe UI", 11, FontStyle.Bold);
            txtUsername.BackColor = Color.FromArgb(16, 17, 22);
            txtUsername.ForeColor = Color.White;
            txtUsername.BorderStyle = BorderStyle.FixedSingle;
            txtUsername.Location = new Point(20, 42);
            txtUsername.Size = new Size(320, 27);
            bodyPanel.Controls.Add(txtUsername);

            Button btnRandom = new Button();
            btnRandom.Text = "🎲 Losuj Nick";
            btnRandom.Location = new Point(350, 42);
            btnRandom.Size = new Size(100, 27);
            btnRandom.BackColor = Color.FromArgb(32, 35, 48);
            btnRandom.ForeColor = Color.White;
            btnRandom.FlatStyle = FlatStyle.Flat;
            btnRandom.FlatAppearance.BorderSize = 0;
            btnRandom.Click += (s, e) =>
            {
                string[] names = { "SpriteGod", "VapeKiller", "CrystalKing", "Anarchy_2B2T", "WurstMaster", "CriticalPVP", "HypixelGod", "MinemenPro" };
                txtUsername.Text = names[new Random().Next(names.Length)];
            };
            bodyPanel.Controls.Add(btnRandom);

            // 2. Dual Version Selector
            Label lblVer = new Label();
            lblVer.Text = "WYBIERZ WERSJĘ MINECRAFT:";
            lblVer.Font = new Font("Segoe UI", 9, FontStyle.Bold);
            lblVer.ForeColor = Color.FromArgb(6, 182, 212);
            lblVer.Location = new Point(20, 85);
            lblVer.AutoSize = true;
            bodyPanel.Controls.Add(lblVer);

            // Card 1: 1.20.4
            Panel card1204 = new Panel();
            card1204.Location = new Point(20, 110);
            card1204.Size = new Size(345, 100);
            card1204.BackColor = Color.FromArgb(24, 27, 38);
            card1204.BorderStyle = BorderStyle.FixedSingle;
            card1204.Cursor = Cursors.Hand;
            card1204.Click += (s, e) => { rb1204.Checked = true; };

            rb1204 = new RadioButton();
            rb1204.Text = "Minecraft 1.20.4 (Modern Anarchy)";
            rb1204.Checked = true;
            rb1204.Font = new Font("Segoe UI", 10, FontStyle.Bold);
            rb1204.ForeColor = Color.FromArgb(16, 185, 129);
            rb1204.Location = new Point(12, 10);
            rb1204.AutoSize = true;
            card1204.Controls.Add(rb1204);

            Label lbl1204Desc = new Label();
            lbl1204Desc.Text = "• Wurst-style ClickGUI & TabGUI (Strzałki)\n• Wallhack & Aimbot • 360° KillAura & Fly\n• Menu pod PRAWYM SHIFTEM";
            lbl1204Desc.Font = new Font("Segoe UI", 8.5F);
            lbl1204Desc.ForeColor = Color.FromArgb(156, 163, 175);
            lbl1204Desc.Location = new Point(32, 38);
            lbl1204Desc.Size = new Size(300, 50);
            card1204.Controls.Add(lbl1204Desc);

            bodyPanel.Controls.Add(card1204);

            // Card 2: 1.8.9
            Panel card189 = new Panel();
            card189.Location = new Point(380, 110);
            card189.Size = new Size(345, 100);
            card189.BackColor = Color.FromArgb(24, 27, 38);
            card189.BorderStyle = BorderStyle.FixedSingle;
            card189.Cursor = Cursors.Hand;
            card189.Click += (s, e) => { rb189.Checked = true; };

            rb189 = new RadioButton();
            rb189.Text = "Minecraft 1.8.9 (Klasyczny PvP)";
            rb189.Font = new Font("Segoe UI", 10, FontStyle.Bold);
            rb189.ForeColor = Color.FromArgb(245, 158, 11);
            rb189.Location = new Point(12, 10);
            rb189.AutoSize = true;
            card189.Controls.Add(rb189);

            Label lbl189Desc = new Label();
            lbl189Desc.Text = "• Block-hitting & brak cooldownu uderzeń\n• Wurst Navigator & ClickGUI (R-Shift)\n• Wallhack + Smooth Aim Assist";
            lbl189Desc.Font = new Font("Segoe UI", 8.5F);
            lbl189Desc.ForeColor = Color.FromArgb(156, 163, 175);
            lbl189Desc.Location = new Point(32, 38);
            lbl189Desc.Size = new Size(300, 50);
            card189.Controls.Add(lbl189Desc);

            bodyPanel.Controls.Add(card189);

            // 3. RAM Slider
            Label lblRam = new Label();
            lblRam.Text = "RAM:";
            lblRam.Font = new Font("Segoe UI", 9, FontStyle.Bold);
            lblRam.ForeColor = Color.FromArgb(245, 158, 11);
            lblRam.Location = new Point(480, 20);
            lblRam.AutoSize = true;
            bodyPanel.Controls.Add(lblRam);

            sliderRam = new TrackBar();
            sliderRam.Minimum = 2;
            sliderRam.Maximum = 16;
            sliderRam.Value = 6;
            sliderRam.TickFrequency = 2;
            sliderRam.Location = new Point(475, 42);
            sliderRam.Size = new Size(180, 45);
            bodyPanel.Controls.Add(sliderRam);

            lblRamVal = new Label();
            lblRamVal.Text = "6 GB";
            lblRamVal.Font = new Font("Segoe UI", 11, FontStyle.Bold);
            lblRamVal.ForeColor = Color.White;
            lblRamVal.Location = new Point(665, 45);
            lblRamVal.AutoSize = true;
            sliderRam.Scroll += (s, e) => { lblRamVal.Text = sliderRam.Value + " GB"; };
            bodyPanel.Controls.Add(lblRamVal);

            // Progress Bar & Status
            progressBar = new ProgressBar();
            progressBar.Location = new Point(20, 225);
            progressBar.Size = new Size(705, 14);
            progressBar.Style = ProgressBarStyle.Continuous;
            progressBar.Visible = false;
            bodyPanel.Controls.Add(progressBar);

            lblStatus = new Label();
            lblStatus.Text = "Menu hacków: Prawy Shift (Right Shift) | TabGUI: Strzałki góra/dół/prawo/lewo";
            lblStatus.Font = new Font("Segoe UI", 9.5F, FontStyle.Bold);
            lblStatus.ForeColor = Color.FromArgb(16, 185, 129);
            lblStatus.Location = new Point(20, 245);
            lblStatus.Size = new Size(705, 24);
            bodyPanel.Controls.Add(lblStatus);

            // 4. Primary Launch Button (Native Minecraft Client)
            btnLaunch = new Button();
            btnLaunch.Text = "⚡ URUCHOM MINECRAFT (Z WBUDOWANYMI HACKAMI & MENU: PRAWY SHIFT)";
            btnLaunch.Font = new Font("Segoe UI", 12, FontStyle.Bold);
            btnLaunch.BackColor = Color.FromArgb(16, 185, 129);
            btnLaunch.ForeColor = Color.Black;
            btnLaunch.FlatStyle = FlatStyle.Flat;
            btnLaunch.FlatAppearance.BorderSize = 0;
            btnLaunch.Location = new Point(20, 280);
            btnLaunch.Size = new Size(705, 54);
            btnLaunch.Cursor = Cursors.Hand;
            btnLaunch.Click += (s, e) => LaunchWurstClient();
            bodyPanel.Controls.Add(btnLaunch);

            // Secondary: Launch Mojang Java Engine
            btnLaunchJava = new Button();
            btnLaunchJava.Text = "🎮 Bezpośredni Start Instancji Java (.jar Minecraft)";
            btnLaunchJava.Font = new Font("Segoe UI", 9.5F, FontStyle.Bold);
            btnLaunchJava.BackColor = Color.FromArgb(32, 35, 48);
            btnLaunchJava.ForeColor = Color.White;
            btnLaunchJava.FlatStyle = FlatStyle.Flat;
            btnLaunchJava.FlatAppearance.BorderSize = 0;
            btnLaunchJava.Location = new Point(20, 345);
            btnLaunchJava.Size = new Size(705, 38);
            btnLaunchJava.Click += async (s, e) => await LaunchMojangJava();
            bodyPanel.Controls.Add(btnLaunchJava);

            this.Controls.Add(bodyPanel);
        }

        private async void LaunchWurstClient()
        {
            await LaunchMojangJava();
        }

        private async Task LaunchMojangJava()
        {
            string user = txtUsername.Text.Trim();
            if (string.IsNullOrEmpty(user)) user = "SpriteHacker";
            string ver = rb189.Checked ? "1.8.9" : "1.20.4";
            int ram = sliderRam.Value;

            try
            {
                string appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
                string mcDir = Path.Combine(appData, ".minecraft");
                string nativesDir = Path.Combine(mcDir, "natives");
                string targetVer = ver;
                if (ver == "1.20.4")
                {
                    string fabricVerDir = Path.Combine(mcDir, "versions", "fabric-loader-0.15.7-1.20.4");
                    if (Directory.Exists(fabricVerDir))
                    {
                        targetVer = "fabric-loader-0.15.7-1.20.4";
                    }
                }

                string versionPathDir = Path.Combine(mcDir, "versions", targetVer);
                string clientJarPath = Path.Combine(versionPathDir, targetVer + ".jar");
                if (!File.Exists(clientJarPath))
                {
                    clientJarPath = Path.Combine(mcDir, "versions", ver, ver + ".jar");
                }

                string cpFilePath = Path.Combine(versionPathDir, "classpath.txt");
                string classpath = clientJarPath;
                if (File.Exists(cpFilePath))
                {
                    classpath = File.ReadAllText(cpFilePath).Trim();
                }
                else
                {
                    // Add mods and fabric libraries to classpath if standard jar
                    classpath = string.Format("{0};{1}\\libraries\\*", clientJarPath, mcDir);
                }

                string javaBin = string.IsNullOrEmpty(detectedJavaPath) ? "java.exe" : detectedJavaPath;
                string mainClass = (targetVer.Contains("fabric")) ? "net.fabricmc.loader.impl.launch.knot.KnotClient" : "net.minecraft.client.main.Main";

                await Task.Run(() =>
                {
                    ProcessStartInfo psi = new ProcessStartInfo();
                    psi.FileName = javaBin;
                    psi.Arguments = string.Format("-Xmx{0}G -Xms1G \"-Djava.library.path={1}\" -cp \"{2}\" {3} --username \"{4}\" --version \"{5}\" --gameDir \"{6}\" --assetsDir \"{6}\\assets\" --assetIndex \"{7}\" --uuid \"00000000-0000-0000-0000-000000000000\" --accessToken \"0\" --userType \"legacy\"",
                        ram, nativesDir, classpath, mainClass, user, targetVer, mcDir, ver);
                    
                    psi.WorkingDirectory = mcDir;
                    psi.UseShellExecute = false;
                    Process.Start(psi);
                });

                lblStatus.Text = "Minecraft Java " + ver + " został uruchomiony!";
            }
            catch (Exception ex)
            {
                MessageBox.Show("Błąd startu: " + ex.Message);
            }
        }
    }
}
