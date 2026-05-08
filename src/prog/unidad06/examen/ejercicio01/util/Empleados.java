package prog.unidad06.examen.ejercicio01.util;

import java.util.Random;

/**
 * Coleccion de empleados que se puede recorrer de forma sencilla
 */
public class Empleados {

  // Constantes
  // Empleados almacenados
  private static final Empleado[] EMPLEADOS = {
    new Empleado("Lazaro", "Linares Quesada", "56528000B", 79, 1517.15, true),
    new Empleado("Antonia Maria", "Rodarte Prieto", "06380722K", 75, 885.7, true),
    new Empleado("Juan Antonio", "Segura Correa", "32214712G", 64, 1796.25, true),
    new Empleado("Miguel", "Carrero Orellana", "83636450P", 80, 2436.0, true),
    new Empleado("Ismelda", "Sauceda Jimenez", "45856065W", 59, 2188.45, false),
    new Empleado("Elisa", "Razo Montoya", "66155069K", 55, 1994.14, true),
    new Empleado("Jonathan", "Montanez Comejo", "75795910M", 35, 1508.82, false),
    new Empleado("Rodolfo", "Maya Agosto", "21056011E", 21, 2593.0, false),
    new Empleado("Serafin", "Dominguez Quintana", "08908937V", 55, 988.35, false),
    new Empleado("Laura Maria", "Sepúlveda Alba", "19214451S", 39, 1477.86, true)
  };
  
  // Atributos
  // Indice del siguiente empleado a devolver
  private int indiceSiguiente;
  // Cantidad de empleados a devolver
  private int cantidadEmpleados;
  
  /**
   * Constructor<br>
   * Crea la colección de forma que devuelve el primer empleado
   */
  public Empleados() {
    reiniciar();
  }
  
  /**
   * Obtiene el siguiente empleado
   * @return Siguiente empleado o null si no hay más empleados.
   */
  public Empleado siguiente() {
    // Si quedan empleados
    if (cantidadEmpleados > 0) {
      // Descuenta un empleado
      cantidadEmpleados--;
      // Devuelve el siguiente e incrementa el indice
      return EMPLEADOS[indiceSiguiente++];
    } else {
      // Si no quedan empleados devuelve null
      return null;
    }
  }
  
  /**
   * Reinicia la colección para volver a devolver los empleados desde el principio
   */
  public void reiniciar() {
    // Ponemos el indice al primero
    indiceSiguiente = 0;
    // Calculamos el número de empleados a devolver
    cantidadEmpleados = new Random().nextInt(0, EMPLEADOS.length + 1);
  }
  
}
