declare const Events: {
  on(name: string, handler: (...args: any[]) => void): void;
  onClient(name: string, handler: (...args: any[]) => void): void;
  emit(name: string, ...args: any[]): void;
  emitServer(name: string, ...args: any[]): void;
};

declare const Web: {
  createView(url: string, options?: Record<string, unknown>): number;
  destroyView(view: number): void;
  on(view: number, event: string, handler: (...args: any[]) => void): void;
  emit(view: number, event: string, ...args: any[]): void;
};

declare const Exports: {
  register(name: string, handler: (...args: any[]) => any): void;
};

declare const Imports: {
  get<T = any>(name: string): T;
};
