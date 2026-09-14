import rawTestimonials from './testimonials.json';

export interface Testimonial {
  id: string;
  name: string;
  company: string;
  role: string;
  image: string;
  alt: string;
  paragraphs: string[];
}

function assertTestimonial(value: Testimonial): Testimonial {
  if (!value.id || !value.name || !value.company || !value.role || !value.alt || value.paragraphs.length < 1) throw new Error(`Invalid testimonial: ${value.id}`);
  if (!value.image.startsWith('static/images/')) throw new Error(`Testimonial image is outside static/images: ${value.image}`);
  return value;
}

export const testimonials = (rawTestimonials as Testimonial[]).map(assertTestimonial);
