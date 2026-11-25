/**
 * Minimal complex number arithmetic for quantum statevector simulation.
 * No external library — quantum amplitudes are complex, so this is required
 * groundwork rather than a stylistic choice.
 */
export class Complex {
  constructor(public re: number, public im: number = 0) {}

  add(o: Complex): Complex {
    return new Complex(this.re + o.re, this.im + o.im);
  }
  sub(o: Complex): Complex {
    return new Complex(this.re - o.re, this.im - o.im);
  }
  mul(o: Complex): Complex {
    return new Complex(
      this.re * o.re - this.im * o.im,
      this.re * o.im + this.im * o.re
    );
  }
  scale(s: number): Complex {
    return new Complex(this.re * s, this.im * s);
  }
  conj(): Complex {
    return new Complex(this.re, -this.im);
  }
  /** |z|^2 — the Born-rule probability weight of an amplitude. */
  abs2(): number {
    return this.re * this.re + this.im * this.im;
  }
}

export function C(re: number, im = 0): Complex {
  return new Complex(re, im);
}
