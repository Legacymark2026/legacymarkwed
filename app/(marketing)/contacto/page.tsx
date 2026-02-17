import { ContactForm } from "@/components/sections/contact-form";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-white pt-24 pb-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid gap-16 lg:grid-cols-2">
                    {/* Contact Info */}
                    <div>
                        <h1 className="mb-6 text-4xl font-bold tracking-tight text-black sm:text-5xl">
                            Hablemos
                        </h1>
                        <p className="mb-12 text-xl text-gray-600">
                            ¿Tienes un proyecto en mente? Estamos listos para ayudarte a llevarlo al siguiente nivel.
                        </p>

                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-black">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-black">Email</h3>
                                    <p className="text-gray-600">hola@legacymark.com</p>
                                    <p className="text-gray-600">soporte@legacymark.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-black">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-black">Teléfono</h3>
                                    <p className="text-gray-600">+1 (555) 123-4567</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-black">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-black">Oficina</h3>
                                    <p className="text-gray-600">
                                        Avenida Innovación 123<br />
                                        Ciudad Tecnológica, CP 10000
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Map Placeholder */}
                        <div className="mt-12 h-64 w-full rounded-2xl bg-gray-100 overflow-hidden relative border border-gray-200">
                            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                                <span className="flex items-center gap-2"><MapPin size={16} /> Mapa Interactivo</span>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div>
                        <ContactForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
