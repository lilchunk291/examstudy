export class Streamer {

    async stream(
        messageId: string,
        text: string,
        updateFn: (id: string, content: string) => void,
        finalizeFn?: (id: string) => void
    ): Promise<void> {
        let displayed = ''
        for (let i = 0; i < text.length; i++) {
            displayed += text[i]
            updateFn(messageId, displayed)
            await this.delay(this.getCharDelay(text[i]))
        }
        if (finalizeFn) finalizeFn(messageId)
    }

    private getCharDelay(char: string): number {
        if (char === '.') return 180 + Math.random() * 120
        if (char === ',') return 70 + Math.random() * 50
        if (char === '\n') return 100
        if (Math.random() < 0.04) return 280 + Math.random() * 200
        return 14 + Math.random() * 20
    }

    private delay(ms: number): Promise<void> {
        return new Promise(r => setTimeout(r, ms))
    }
}
