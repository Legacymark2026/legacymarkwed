import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Instrucciones de Eliminación de Datos | LegacyMark',
    description: 'Instrucciones para solicitar la eliminación de tus datos personales de LegacyMark.',
};

export default function DataDeletionPage() {
    return (
        <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-8">
                    Instrucciones de Eliminación de Datos
                </h1>

                <div className="prose prose-lg text-gray-600">
                    <p>
                        De acuerdo con las reglas de la Plataforma de Facebook y Meta, proporcionamos las siguientes instrucciones
                        para que los usuarios soliciten la eliminación de sus datos.
                    </p>

                    <h3>¿Cómo solicitar la eliminación de datos?</h3>
                    <p>
                        Si deseas eliminar tus datos asociados con la aplicación <strong>LegacyMark</strong>, puedes hacerlo
                        siguiendo estos pasos:
                    </p>

                    <ol>
                        <li>
                            Envía un correo electrónico a nuestro equipo de soporte de privacidad a:
                            <br />
                            <a href="mailto:soporte@legacymarksas.com" className="text-blue-600 hover:text-blue-800 font-medium">
                                soporte@legacymarksas.com
                            </a>
                        </li>
                        <li>
                            Utiliza el asunto: <strong>"Solicitud de Eliminación de Datos de Usuario"</strong>.
                        </li>
                        <li>
                            En el cuerpo del correo, por favor incluye tu nombre completo y el correo electrónico o número de teléfono
                            asociado con tu cuenta.
                        </li>
                    </ol>

                    <h3>¿Qué sucede después?</h3>
                    <p>
                        Una vez recibida tu solicitud:
                    </p>
                    <ul>
                        <li>
                            Nuestro equipo revisará la solicitud y verificará tu identidad.
                        </li>
                        <li>
                            Procederemos a eliminar todos los datos personales asociados (nombre, ID de Facebook/Instagram, historial de mensajes)
                            de nuestros servidores en un plazo máximo de 30 días.
                        </li>
                        <li>
                            Recibirás un correo de confirmación con un código único de seguimiento de tu solicitud de eliminación.
                        </li>
                    </ul>

                    <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-500">
                        <p className="mb-0">
                            Para más información sobre cómo manejamos tus datos, por favor consulta nuestra{' '}
                            <a href="/politica-privacidad" className="underline hover:text-gray-900">
                                Política de Privacidad
                            </a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
