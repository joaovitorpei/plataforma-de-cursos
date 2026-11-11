import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { cores } from '../styles/theme';

export default function LoginScreen() {
  // Estados dos campos do formulário
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  function handleLogin() {
    // Validação simples dos campos antes de entrar
    if (!email.trim() || !senha) {
      setErro('Preencha o e-mail e a senha.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setErro('Digite um e-mail válido.');
      return;
    }
    setErro('');

    // Próxima etapa: chamar a API NestJS (POST /auth/login)
    // e ir para a tela principal com navigation.replace('Principal')
    Alert.alert('Tudo certo', 'Campos válidos.');
  }

  return (
    // KeyboardAvoidingView: empurra o conteúdo para cima quando o teclado abre (iOS)
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* BLOCO 1: cabeçalho */}
      <View style={styles.cabecalho}>
        {/* Logo feita com View: um círculo (borderRadius = metade do tamanho) */}
        <View style={styles.logo}>
          <Text style={styles.logoTexto}>E</Text>
        </View>
        <Text style={styles.titulo}>EduCursos</Text>
        <Text style={styles.subtitulo}>Entre para continuar seus cursos</Text>
      </View>

      {/* BLOCO 2: formulário */}
      <View style={styles.formulario}>
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor={cores.cinza}
          keyboardType="email-address" // teclado com @
          autoCapitalize="none"         // não coloca maiúscula automática
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor={cores.cinza}
          secureTextEntry               // esconde os caracteres
          value={senha}
          onChangeText={setSenha}
        />

        {/* alignSelf: só este item vai para a direita */}
        <Text style={styles.esqueci}>Esqueci a senha</Text>

        {/* Mensagem de erro só aparece quando a validação falha */}
        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <TouchableOpacity style={styles.botao} onPress={handleLogin}>
          <Text style={styles.botaoTexto}>ENTRAR</Text>
        </TouchableOpacity>
      </View>

      {/* BLOCO 3: rodapé em linha */}
      <View style={styles.rodape}>
        <Text style={styles.rodapeTexto}>Ainda não tem conta? </Text>
        {/* A tela de Registro e a navegação entram na próxima etapa */}
        <Text style={styles.link}>Cadastre-se</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,                    // ocupa a tela inteira
    justifyContent: 'center',   // blocos no centro vertical
    padding: 24,
    gap: 32,                    // espaço entre os três blocos
    backgroundColor: cores.fundo,
  },
  cabecalho: {
    alignItems: 'center',       // centraliza logo e textos na horizontal
    gap: 8,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: cores.primaria,
    justifyContent: 'center',   // centraliza a letra nos dois eixos
    alignItems: 'center',
  },
  logoTexto: { color: cores.branco, fontSize: 36, fontWeight: 'bold' },
  titulo: { fontSize: 26, fontWeight: 'bold', color: cores.texto },
  subtitulo: { color: cores.cinza },
  formulario: {
    gap: 12,                    // sem alignItems: os inputs esticam (stretch)
  },
  input: {
    height: 50,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.branco,
    color: cores.texto,
  },
  esqueci: {
    alignSelf: 'flex-end',      // sobrescreve o stretch: vai para a direita
    color: cores.primaria,
  },
  erro: { color: cores.erro, textAlign: 'center' },
  botao: {
    height: 50,
    borderRadius: 10,
    backgroundColor: cores.primaria,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoTexto: { color: cores.branco, fontWeight: 'bold', fontSize: 16 },
  rodape: {
    flexDirection: 'row',       // textos lado a lado
    justifyContent: 'center',   // centralizados na horizontal
  },
  rodapeTexto: { color: cores.texto },
  link: { color: cores.primaria, fontWeight: 'bold' },
});
