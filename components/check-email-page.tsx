export function CheckEmailPage() {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!navigation.isValidTransition('signup', 'check-email')) {
      router.push('/signup');
      return;
    }

    const { email } = navigation.getData('check-email');
    if (!email) {
      router.push('/signup');
    }
  }, [router]);

  const handleVerificationComplete = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      navigation.connect('check-email', 'verify-email');
      router.push('/verify-email');
    } catch (error) {
      toast({
        title: "Error",
        description: "Verification failed",
        variant: "destructive"
      });
    }
  };

  // Component JSX
}