export class BootstrapConsole {
  static banner(appName: string): string {
    const line = '='.repeat(70);

    return `
  ${line}
   ${appName.toUpperCase()}
  ${line}
  `;
  }

  static section(title: string): string {
    return `========== ${title.toUpperCase()} ==========`;
  }
}
