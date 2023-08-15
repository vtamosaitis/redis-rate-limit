// calculateTotalService.ts
export async function calculateTotal(a: number, b: number): Promise<number> {
    const randomDelay = Math.random() * 3000;
    await new Promise(resolve => setTimeout(resolve, randomDelay));
    const total = a + b;
    return total;
}
