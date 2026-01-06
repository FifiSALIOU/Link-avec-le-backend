import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { UserRole } from "@/types/ticket";
import { authApi } from "@/lib/api";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn, Shield, User as UserIcon, Wrench, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const roleIcons: Record<UserRole, typeof UserIcon> = {
  user: UserIcon,
  dsi: Shield,
  adjoint: Users,
  technician: Wrench,
  admin: Shield,
};

const roleDescriptions: Record<UserRole, string> = {
  user: "Créer et suivre vos tickets",
  dsi: "Gérer et déléguer les tickets",
  adjoint: "Assigner les tickets délégués",
  technician: "Résoudre les problèmes techniques",
  admin: "Administration complète du système",
};

// Fonction pour déterminer la redirection selon le rôle
function getRedirectPathForRole(role: UserRole): string {
  // Pour l'instant, tous les rôles vont vers le dashboard
  // Le dashboard affiche le contenu approprié selon le rôle
  return '/dashboard';
}

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("user");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setCurrentUser, loadData } = useApp();

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Essayer de récupérer l'utilisateur actuel
      authApi.getCurrentUser()
        .then(user => {
          setCurrentUser(user);
          navigate("/dashboard");
        })
        .catch(() => {
          // Token invalide, on reste sur la page de login
          localStorage.removeItem('access_token');
        });
    }
  }, [navigate, setCurrentUser]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error("Erreur de connexion", {
        description: "Veuillez remplir tous les champs",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('[Login] Tentative de connexion avec:', { username, password: '***' });
      
      // Appel API pour se connecter
      const tokenResponse = await authApi.login({ username, password });
      console.log('[Login] Token reçu:', tokenResponse);
      
      // Récupérer les informations de l'utilisateur connecté
      console.log('[Login] Récupération des informations utilisateur...');
      const user = await authApi.getCurrentUser();
      console.log('[Login] Utilisateur récupéré:', user);
      
      // Définir l'utilisateur connecté
      setCurrentUser(user);
      
      // Afficher le message de bienvenue
      toast.success(`Bienvenue, ${user.name}!`, {
        description: "Connexion réussie",
      });
      
      // Redirection immédiate vers le dashboard
      const redirectPath = getRedirectPathForRole(user.role);
      console.log('[Login] Redirection vers:', redirectPath, 'pour le rôle:', user.role);
      
      // Rediriger immédiatement
      navigate(redirectPath, { replace: true });
      
      // Charger les données en arrière-plan après la redirection (ne bloque pas)
      console.log('[Login] Chargement des données en arrière-plan...');
      loadData(user).catch((error) => {
        console.error('[Login] Erreur lors du chargement des données (non bloquante):', error);
        // Les erreurs de chargement de données ne doivent pas bloquer la connexion
        toast.error('Avertissement', {
          description: 'Certaines données n\'ont pas pu être chargées. Vous pouvez réessayer plus tard.',
          duration: 5000,
        });
      });
    } catch (error: any) {
      console.error('[Login] Erreur complète:', error);
      console.error('[Login] Type d\'erreur:', error.constructor.name);
      console.error('[Login] Message d\'erreur:', error.message);
      console.error('[Login] Stack:', error.stack);
      
      // Message d'erreur plus détaillé - seulement pour les erreurs de connexion réelles
      let errorMessage = "Nom d'utilisateur ou mot de passe incorrect";
      if (error.message) {
        if (error.message.includes('Impossible de se connecter au serveur')) {
          errorMessage = error.message;
        } else if (error.message.includes('Incorrect username or password')) {
          errorMessage = "Nom d'utilisateur ou mot de passe incorrect";
        } else if (error.message.includes('account is inactive')) {
          errorMessage = "Votre compte est désactivé. Contactez l'administrateur.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error("Erreur de connexion", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const Icon = roleIcons[selectedRole];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 xl:px-24 bg-card">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <img src={logo} alt="Logo" className="h-14 w-14 rounded-2xl shadow-lg" />
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                HelpDesk
              </h1>
              <p className="text-sm text-muted-foreground">
                Système de gestion des tickets
              </p>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">
              Connexion
            </h2>
            <p className="text-muted-foreground">
              Connectez-vous pour accéder à votre espace
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input
                id="username"
                type="text"
                placeholder="votre.nom.utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Profil de connexion</Label>
              <Select
                value={selectedRole}
                onValueChange={(v) => setSelectedRole(v as UserRole)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      <span>Utilisateur</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dsi">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>DSI</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="adjoint">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Adjoint DSI</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="technician">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      <span>Technicien</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Administrateur</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {roleDescriptions[selectedRole]}
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin" />
                  <span>Connexion...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="h-5 w-5" />
                  <span>Se connecter</span>
                </div>
              )}
            </Button>

            <div className="text-center">
              <a
                href="#"
                className="text-sm text-secondary hover:text-secondary/80 transition-colors"
              >
                Mot de passe oublié ?
              </a>
            </div>
          </form>
        </div>
      </div>

      {/* Right Panel - Illustration */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-secondary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary/30 rounded-full blur-2xl animate-pulse-slow" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-16 text-center">
          <div className={cn(
            "mb-8 p-6 rounded-3xl bg-card/10 backdrop-blur-sm border border-secondary/30",
            "animate-bounce-subtle"
          )}>
            <Icon className="h-20 w-20 text-secondary" />
          </div>

          <h2 className="font-display text-4xl font-bold text-primary-foreground mb-4">
            Bienvenue sur HelpDesk
          </h2>
          <p className="text-xl text-primary-foreground/80 max-w-md">
            Votre solution intégrée de gestion des tickets IT pour une résolution rapide et efficace de vos problèmes.
          </p>

          {/* Features */}
          <div className="mt-12 grid grid-cols-3 gap-6 max-w-lg">
            {[
              { label: "Tickets créés", value: "1,234" },
              { label: "Résolus ce mois", value: "892" },
              { label: "Satisfaction", value: "98%" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-xl bg-card/10 backdrop-blur-sm border border-secondary/20"
              >
                <p className="text-2xl font-bold text-secondary">{stat.value}</p>
                <p className="text-xs text-primary-foreground/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
