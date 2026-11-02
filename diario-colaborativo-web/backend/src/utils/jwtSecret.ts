// Devolve o segredo JWT. Fora dos testes, recusa arrancar com um segredo por omissão,
// o que permitiria a qualquer pessoa forjar tokens válidos.
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'test') return 'test-secret';
  throw new Error('JWT_SECRET não está definido.');
}
