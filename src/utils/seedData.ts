import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const seedDatabase = async (userId: string) => {
  try {
    toast.loading("Gerando dados fictícios...");

    // 1. Serviços
    const services = [
      { name: "Corte Feminino", price: 80.00, duration: 60 },
      { name: "Corte Masculino", price: 50.00, duration: 30 },
      { name: "Manicure", price: 40.00, duration: 45 },
      { name: "Pedicure", price: 45.00, duration: 45 },
      { name: "Coloração", price: 150.00, duration: 120 },
      { name: "Hidratação", price: 90.00, duration: 40 },
    ];

    const servicesData = services.map(s => ({
      user_id: userId,
      name: s.name,
      price: s.price,
      duration: s.duration,
      active: true
    }));

    const { data: createdServices, error: servicesError } = await supabase
      .from("services")
      .insert(servicesData)
      .select();

    if (servicesError) throw servicesError;

    // 2. Profissionais
    const professionals = [
      { name: "Ana Silva", specialty: "Cabeleireira" },
      { name: "Beatriz Santos", specialty: "Manicure" },
      { name: "Carlos Oliveira", specialty: "Barbeiro" },
    ];

    const professionalsData = professionals.map(p => ({
      user_id: userId,
      name: p.name,
      specialty: p.specialty,
      active: true
    }));

    const { data: createdProfessionals, error: professionalsError } = await supabase
      .from("professionals")
      .insert(professionalsData)
      .select();

    if (professionalsError) throw professionalsError;

    // 3. Clientes
    const clients = [
      { name: "Fernanda Lima", phone: "11999991111" },
      { name: "Roberto Costa", phone: "11999992222" },
      { name: "Juliana Alves", phone: "11999993333" },
      { name: "Patricia Gomes", phone: "11999994444" },
      { name: "Ricardo Pereira", phone: "11999995555" },
      { name: "Lucas Souza", phone: "11999996666" },
      { name: "Camila Rocha", phone: "11999997777" },
      { name: "Marcos dias", phone: "11999998888" },
    ];

    const clientsData = clients.map(c => ({
      user_id: userId,
      name: c.name,
      phone: c.phone,
      notes: "Cliente fiel"
    }));

    const { data: createdClients, error: clientsError } = await supabase
      .from("clients")
      .insert(clientsData)
      .select();

    if (clientsError) throw clientsError;

    // 4. Agendamentos (Passados e Futuros)
    const appointmentsData: any[] = [];
    const today = new Date();

    // Agendamentos HOJE e FUTURO
    if (createdClients && createdProfessionals && createdServices) {
      // Futuro 1
      const date1 = new Date(today);
      date1.setDate(date1.getDate() + 1); // Amanhã
      date1.setHours(10, 0, 0, 0);

      appointmentsData.push({
        user_id: userId,
        client_id: createdClients[0].id,
        professional_id: createdProfessionals[0].id,
        service_id: createdServices[0].id,
        date: date1.toISOString(),
        status: "confirmed"
      });

      // Futuro 2
      const date2 = new Date(today);
      date2.setDate(date2.getDate() + 2);
      date2.setHours(14, 0, 0, 0);
      appointmentsData.push({
        user_id: userId,
        client_id: createdClients[1].id,
        professional_id: createdProfessionals[1].id,
        service_id: createdServices[2].id,
        date: date2.toISOString(),
        status: "pending"
      });

      // Passado 1 (Ontem)
      const date3 = new Date(today);
      date3.setDate(date3.getDate() - 1);
      date3.setHours(9, 0, 0, 0);
      appointmentsData.push({
        user_id: userId,
        client_id: createdClients[2].id,
        professional_id: createdProfessionals[0].id,
        service_id: createdServices[4].id,
        date: date3.toISOString(),
        status: "completed"
      });
    }

    const { error: appointmentsError } = await supabase
      .from("appointments")
      .insert(appointmentsData);

    if (appointmentsError) throw appointmentsError;

    toast.dismiss();
    toast.success("Dados gerados com sucesso!");
    return true;

  } catch (error) {
    console.error("Erro ao gerar seed:", error);
    toast.dismiss();
    toast.error("Erro ao gerar dados. Verifique o console.");
    return false;
  }
};
