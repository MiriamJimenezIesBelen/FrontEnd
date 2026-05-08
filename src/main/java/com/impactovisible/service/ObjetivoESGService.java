package com.impactovisible.service;

import com.impactovisible.domain.ObjetivoESG;
import com.impactovisible.repository.ObjetivoESGRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ObjetivoESGService {

  @Autowired
  private ObjetivoESGRepository repo;

  public ObjetivoESG crear(ObjetivoESG obj) {
    return repo.save(obj);
  }

  public List<ObjetivoESG> porEmpresa(Long idEmpresa) {
    return repo.findByIdEmpresa(idEmpresa);
  }
}
