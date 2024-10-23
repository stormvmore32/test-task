"use client";
import React, { useState, useEffect } from "react";
import styles from "./FormComponent.module.scss";
import ReactInputMask from "react-input-mask-next";

interface City {
  city: string;
  population: string;
}

export const FormComponent: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>("");
  const [telNumber, setTelNumber] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isAgreed, setIsAgreed] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [submissionTime, setSubmissionTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setName(storedName);
    }

    const fetchCities = async () => {
      const response = await fetch("/api/formApi");
      const data: City[] = await response.json();

      const filteredCities = data.filter(
        (cityData) => parseInt(cityData.population) > 50000
      );
      const sortedCities = filteredCities.sort((a, b) =>
        a.city.localeCompare(b.city)
      );

      const maxPopulationCity = data.reduce((prev, current) => {
        return parseInt(prev.population) > parseInt(current.population)
          ? prev
          : current;
      });

      setCities(sortedCities);
      setSelectedCity(maxPopulationCity.city);
    };

    fetchCities();
  }, []);

  const validateName = (value: string) => {
    if (value.length < 2) {
      return "Имя должно содержать минимум 2 кириллические буквы.";
    }
    if (!/^[а-яА-ЯёЁ]+$/.test(value)) {
      return "Имя должно содержать только кириллические буквы.";
    }
    return "";
  };

  const validatePassword = (value: string) => {
    if (value.length < 6 || !/^[a-zA-Z]+$/.test(value)) {
      return "Пароль должен содержать минимум 6 латинских букв.";
    }
    return "";
  };

  const validatePasswordConfirmation = (value: string) => {
    if (value !== password) {
      return "Пароли не совпадают.";
    }
    return "";
  };

  const validateEmail = (value: string) => {
    if (isAgreed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Введите корректный адрес электронной почты.";
    }
    return "";
  };

  const handleChange =
    (
      setter: React.Dispatch<React.SetStateAction<string>>,
      validator: (value: string) => string,
      field: string
    ) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setter(value);
      setErrors((prevErrors) => ({
        ...prevErrors,
        [field]: validator(value),
      }));
    };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    const newErrors = {
      name: validateName(name),
      password: validatePassword(password),
      passwordConfirmation: validatePasswordConfirmation(passwordConfirmation),
      email: validateEmail(email),
    };

    setErrors(newErrors);

    if (Object.values(newErrors).every((error) => error === "")) {
      localStorage.setItem("userName", name);
      fetch("/api/formApi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          selectedCity,
          password,
          telNumber,
          email,
        }),
      });
      setSubmissionTime(new Date().toLocaleString());

      setName("");
      setPassword("");
      setPasswordConfirmation("");
      setTelNumber("");
      setEmail("");
      setIsAgreed(false);
      setSelectedCity(cities.length > 0 ? cities[0].city : "");
      setErrors({});
    }
    setIsSubmitting(false);
  };

  return (
    <div className={styles.formContainer}>
      <h1>
        {submissionTime || name
          ? `Здравствуйте, ${localStorage.getItem("userName")}`
          : "Здравствуйте, Человек"}
      </h1>
      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        <div className={styles.inputArea}>
          <label htmlFor="name" className={styles.label}>
            Имя<span className={styles.required}>*</span>
          </label>
          <input
            className={styles.input}
            id="name"
            placeholder="Введите имя"
            value={name}
            onChange={handleChange(setName, validateName, "name")}
          />
          {errors.name && <span className={styles.error}>{errors.name}</span>}
        </div>
        <div className={`${styles.inputArea} ${styles.hl}`}>
          <label htmlFor="city" className={styles.label}>
            Ваш город<span className={styles.required}>*</span>
          </label>

          <select
            className={styles.input}
            id="city"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            {cities.map((cityData, index) => (
              <option key={index} value={cityData.city}>
                {cityData.city}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.inputArea}>
          <label htmlFor="password" className={styles.label}>
            Пароль<span className={styles.required}>*</span>
          </label>
          <input
            className={styles.input}
            id="password"
            type="password"
            placeholder="Введите пароль"
            value={password}
            onChange={handleChange(setPassword, validatePassword, "password")}
          />

          {errors.password && (
            <span className={styles.error}>{errors.password}</span>
          )}
        </div>
        <div className={`${styles.inputArea} ${styles.hl}`}>
          <label htmlFor="passwordConfirmation" className={styles.label}>
            Пароль ещё раз<span className={styles.required}>*</span>
          </label>
          <input
            className={styles.input}
            type="password"
            id="passwordConfirmation"
            placeholder="Повторите пароль"
            value={passwordConfirmation}
            onChange={handleChange(
              setPasswordConfirmation,
              validatePasswordConfirmation,
              "passwordConfirmation"
            )}
          />

          {errors.passwordConfirmation && (
            <span className={styles.error}>{errors.passwordConfirmation}</span>
          )}
        </div>

        <div className={styles.inputArea}>
          <label htmlFor="telNumber" className={styles.label}>
            Номер телефона
          </label>
          <ReactInputMask
            className={styles.input}
            mask="+7 (999) 999-99-99"
            maskPlaceholder="*"
            alwaysShowMask={true}
            onChange={(e) => setTelNumber(e.target.value)}
          />
        </div>
        <div className={styles.inputArea}>
          <label htmlFor="email" className={styles.label}>
            Электронная почта
            {isAgreed && (
              <span className={isAgreed ? styles.required : ""}>*</span>
            )}
          </label>
          <input
            className={styles.input}
            id="email"
            type="email"
            value={email}
            onChange={handleChange(setEmail, validateEmail, "email")}
            disabled={!isAgreed}
          />

          {errors.email && <span className={styles.error}>{errors.email}</span>}
        </div>
        <div className={styles.checkboxGroup}>
          <label htmlFor="checkbox" className={styles.label}>
            Я согласен
          </label>
          <input
            className={styles.input}
            id="checkbox"
            type="checkbox"
            checked={isAgreed}
            onChange={() => setIsAgreed(!isAgreed)}
          />
          принимать актуальную информацию на емаил
        </div>
<div className={styles.buttonArea}>
        <button
          className={styles.button}
          type="submit"
          disabled={
            Object.keys(errors).some((key) => errors[key]) || isSubmitting
          }
        >
          Изменить
        </button>
        {submissionTime && <p>последнее изменение: {submissionTime}</p>}
        </div>
      </form>

      
    </div>
  );
};

export default FormComponent;
