package prog.unidad06.examen.ejercicio01.util;

/**
 * Empleado
 */
public class Empleado {

  // Atributos
  // Nombre de pila
  private String nombre;
  // Apellidos
  private String apellidos;
  // DNI
  private String dni;
  // Edad
  private int edad;
  // Salario
  private double salario;
  // Casado ?
  private boolean casado;

  /**
   * Constructor con todos los datos
   * @param nombre Nombre de pila del cliente
   * @param apellidos Apellidos del cliente
   * @param dni DNI del cliente (8 números y una letra)
   * @param edad Edad del cliente
   * @param salario Salario del cliente (en euros)
   * @param casado true si está casado. false en caso contrario
   */
  public Empleado(String nombre, String apellidos, String dni, int edad, double salario,
      boolean casado) {
    this.nombre = nombre;
    this.apellidos = apellidos;
    this.dni = dni;
    this.edad = edad;
    this.salario = salario;
    this.casado = casado;
  }
  
  /**
   * Obtiene el nombre de pila
   * @return nombre de pila
   */
  public String getNombre() {
    return nombre;
  }
  
  /**
   * Obtiene los apellidos
   * @return apellidos
   */
  public String getApellidos() {
    return apellidos;
  }
  
  /**
   * Obtiene el DNI
   * @return DNI
   */
  public String getDni() {
    return dni;
  }
  
  /**
   * Obtiene la edad
   * @return edad
   */
  public int getEdad() {
    return edad;
  }
  
  /**
   * Obtiene el salario
   * @return salario
   */
  public double getSalario() {
    return salario;
  }
  
  /**
   * Obtiene si está casado o no
   * @return true si está casado. false si no
   */
  public boolean isCasado() {
    return casado;
  }
  
}
